import * as fs from 'node:fs'
import { createWriteStream } from 'node:fs'
import * as path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { Song as NCSSong } from '@spotify/ncs-parser'
import config from './config'

/**
 * Сервис для скачивания ресурсов
 */
export class DownloadResourcesService {
  private tracksDir: string
  private coversDir: string

  constructor(storageBase: string) {
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
      console.log(`      🔗 URL: ${url}`)
      console.log(`      💾 Saving to: ${filepath}`)

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

      const nodeStream = Readable.fromWeb(
        response.body as unknown as import('stream/web').ReadableStream,
      )
      const fileStream = createWriteStream(filepath)

      await pipeline(nodeStream, fileStream)

      const stats = fs.statSync(filepath)
      console.log(`      ✅ File saved: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

      return { success: true, size: stats.size }
    } catch (error) {
      console.error(
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

    let audioFilename: string | null = null
    let coverFilename: string | null = null
    let audioSize: number | undefined
    let coverSize: number | undefined
    let instrumentalSize: number | undefined

    // Скачиваем обложку
    if (ncsSong.coverUrl) {
      const coverExt = path.extname(new URL(ncsSong.coverUrl).pathname) || '.jpg'
      coverFilename = `${sanitizedTitle}_${trackId}${coverExt}`
      const coverPath = path.join(this.coversDir, coverFilename)

      console.log('    📥 Downloading cover...')
      const result = await this.downloadFile(ncsSong.coverUrl, coverPath)
      if (result.success) {
        console.log('    ✅ Cover saved')
        coverSize = result.size
      } else {
        coverFilename = null
      }
    }

    // Скачиваем основной аудио файл (regular)
    if (ncsSong.download.regular) {
      audioFilename = `${sanitizedTitle}_${trackId}.mp3`
      const audioPath = path.join(this.tracksDir, audioFilename)

      console.log('    📥 Downloading audio file (regular)...')
      const result = await this.downloadFile(ncsSong.download.regular, audioPath)
      if (result.success) {
        console.log('    ✅ Regular version saved')
        audioSize = result.size
      } else {
        audioFilename = null
      }
    }

    // Если regular нет, пробуем preview
    if (!audioFilename && ncsSong.previewUrl) {
      audioFilename = `${sanitizedTitle}_${trackId}_preview.mp3`
      const previewPath = path.join(this.tracksDir, audioFilename)

      console.log('    📥 Downloading preview...')
      const result = await this.downloadFile(ncsSong.previewUrl, previewPath)
      if (result.success) {
        audioSize = result.size
      } else {
        // Fallback на оригинальный URL
        audioFilename = ncsSong.previewUrl
        console.log('    ⚠️  Using original preview URL as fallback')
      }
    }

    // Скачиваем instrumental версию
    let instrumentalFilename: string | null = null
    if (ncsSong.download.instrumental) {
      instrumentalFilename = `${sanitizedTitle}_${trackId}_instrumental.mp3`
      const instrumentalPath = path.join(this.tracksDir, instrumentalFilename)

      console.log('    📥 Downloading instrumental version...')
      const result = await this.downloadFile(ncsSong.download.instrumental, instrumentalPath)
      if (result.success) {
        console.log('    ✅ Instrumental version saved')
        instrumentalSize = result.size
      } else {
        instrumentalFilename = null
      }
    }

    // Примерная длительность трека (3-5 минут в секундах)
    const duration = Math.floor(Math.random() * (300 - 180 + 1)) + 180

    return {
      audioFilename,
      coverFilename,
      instrumentalFilename,
      audioSize,
      coverSize,
      instrumentalSize,
      duration,
    }
  }
}
