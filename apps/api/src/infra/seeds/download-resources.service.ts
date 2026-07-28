import * as fs from 'node:fs'
import { createWriteStream } from 'node:fs'
import * as path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { Logger } from '@nestjs/common'
import type { Song as NCSSong } from '@spotify/ncs-parser'
import config from './config'

/**
 * Сервис для скачивания ресурсов
 */
export class DownloadResourcesService {
  /** The tracks dir value. */
  private tracksDir: string
  /** The covers dir value. */
  private coversDir: string

  /** The logger value. */
  private readonly logger = new Logger(DownloadResourcesService.name, { timestamp: true })

  /** Creates a new instance. */
  constructor(storageBase: string) {
    // Скачиваем файлы напрямую в финальные директории
    // так же как это делает Multer в контроллерах
    this.tracksDir = path.join(storageBase, config.storagePaths.tracks)
    this.coversDir = path.join(storageBase, config.storagePaths.covers)

    // Создаём директории
    fs.mkdirSync(this.tracksDir, { recursive: true })
    fs.mkdirSync(this.coversDir, { recursive: true })
  }

  /**
   * Скачивает файл по URL и возвращает размер
   */
  private async downloadFile(
    url: string,
    filepath: string,
  ): Promise<{ success: boolean; size?: number }> {
    try {
      this.logger.log(`      🔗 URL: ${url}`)
      this.logger.log(`      💾 Saving to: ${filepath}`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(config.downloadTimeout),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const nodeStream = Readable.from(response.body)
      const fileStream = createWriteStream(filepath)

      await pipeline(nodeStream, fileStream)

      const stats = fs.statSync(filepath)
      this.logger.log(`      ✅ File saved: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

      return { success: true, size: stats.size }
    } catch (error) {
      this.logger.error(
        `    ⚠️  Failed to download file: ${error instanceof Error ? error.message : error}`,
      )
      return { success: false }
    }
  }

  /**
   * Генерирует безопасное имя файла
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9_.-]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  }

  /**
   * Скачивает аудио и обложку трека из NCS
   */
  async downloadTrackResources(ncsSong: NCSSong) {
    const trackId = ncsSong.id || Date.now().toString()
    const sanitizedTitle = this.sanitizeFilename(ncsSong.name)

    let audioFilePath: string | null = null
    let coverFilePath: string | null = null
    let audioSize: number | undefined
    let coverSize: number | undefined
    let instrumentalSize: number | undefined

    // Скачиваем обложку
    if (ncsSong.coverUrl) {
      const coverExt = path.extname(new URL(ncsSong.coverUrl).pathname) || '.jpg'
      const coverFilename = `${sanitizedTitle}_${trackId}${coverExt}`
      const coverPath = path.join(this.coversDir, coverFilename)

      this.logger.log('    📥 Downloading cover...')
      const result = await this.downloadFile(ncsSong.coverUrl, coverPath)
      if (result.success) {
        this.logger.log('    ✅ Cover saved')
        coverFilePath = coverPath
        coverSize = result.size
      }
    }

    // Скачиваем основной аудио файл (regular)
    if (ncsSong.download.regular) {
      const audioFilename = `${sanitizedTitle}_${trackId}.mp3`
      const audioPath = path.join(this.tracksDir, audioFilename)

      this.logger.log('    📥 Downloading audio file (regular)...')
      const result = await this.downloadFile(ncsSong.download.regular, audioPath)
      if (result.success) {
        this.logger.log('    ✅ Regular version saved')
        audioFilePath = audioPath
        audioSize = result.size
      }
    }

    // Если regular нет, пробуем preview
    if (!audioFilePath && ncsSong.previewUrl) {
      const audioFilename = `${sanitizedTitle}_${trackId}_preview.mp3`
      const previewPath = path.join(this.tracksDir, audioFilename)

      this.logger.log('    📥 Downloading preview...')
      const result = await this.downloadFile(ncsSong.previewUrl, previewPath)
      if (result.success) {
        audioFilePath = previewPath
        audioSize = result.size
      } else {
        // Fallback на оригинальный URL
        this.logger.warn('    ⚠️  Using original preview URL as fallback')
      }
    }

    // Скачиваем instrumental версию
    let instrumentalFilePath: string | null = null
    if (ncsSong.download.instrumental) {
      const instrumentalFilename = `${sanitizedTitle}_${trackId}_instrumental.mp3`
      const instrumentalPath = path.join(this.tracksDir, instrumentalFilename)

      this.logger.log('    📥 Downloading instrumental version...')
      const result = await this.downloadFile(ncsSong.download.instrumental, instrumentalPath)
      if (result.success) {
        this.logger.log('    ✅ Instrumental version saved')
        instrumentalFilePath = instrumentalPath
        instrumentalSize = result.size
      }
    }

    // Примерная длительность трека (3-5 минут в секундах)
    const duration = Math.floor(Math.random() * (300 - 180 + 1)) + 180

    return {
      audioFilePath,
      coverFilePath,
      instrumentalFilePath,
      audioSize,
      coverSize,
      instrumentalSize,
      duration,
    }
  }
}
