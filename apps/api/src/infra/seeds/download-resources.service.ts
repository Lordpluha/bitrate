import { writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import type { Song as NCSSong } from '@bitrate/ncs-parser'
import { Logger } from '@nestjs/common'
import { getUploadTempDir } from '../../modules/tracks/audio-scratch'
import config from './config'

/** The bytes of a downloaded file. */
type Downloaded = { success: true; data: Buffer } | { success: false }

/**
 * Сервис для скачивания ресурсов
 *
 * Nothing is kept in a local storage directory: a cover is returned as an in-memory buffer and an
 * audio file is written to the private upload directory (`getUploadTempDir`), exactly where a
 * multipart upload would land. `TrackUploadService.create` then moves both into STORAGE_SERVICE.
 */
export class DownloadResourcesService {
  /** The logger value. */
  private readonly logger = new Logger(DownloadResourcesService.name, { timestamp: true })

  /** Creates a new instance. `audioDir` defaults to the private upload directory. */
  constructor(private readonly audioDir: string = getUploadTempDir()) {}

  /**
   * Скачивает файл по URL в память
   */
  private async download(url: string): Promise<Downloaded> {
    try {
      this.logger.log(`      🔗 URL: ${url}`)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(config.downloadTimeout),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = Buffer.from(await response.arrayBuffer())
      this.logger.log(`      ✅ Downloaded: ${(data.length / 1024 / 1024).toFixed(2)} MB`)
      return { success: true, data }
    } catch (error) {
      this.logger.error(
        `    ⚠️  Failed to download file: ${error instanceof Error ? error.message : error}`,
      )
      return { success: false }
    }
  }

  /** Скачивает аудио в приватную рабочую директорию и возвращает путь и размер. */
  private async downloadAudio(url: string, filename: string) {
    const result = await this.download(url)
    if (!result.success) return null

    const filePath = path.join(this.audioDir, filename)
    await writeFile(filePath, result.data)
    return { filePath, size: result.data.length }
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
    let coverBuffer: Buffer | null = null
    let audioSize: number | undefined
    let instrumentalSize: number | undefined

    // Скачиваем обложку (остаётся в памяти — на диск не пишется)
    if (ncsSong.coverUrl) {
      this.logger.log('    📥 Downloading cover...')
      const result = await this.download(ncsSong.coverUrl)
      if (result.success) {
        this.logger.log('    ✅ Cover downloaded')
        coverBuffer = result.data
      }
    }

    // Скачиваем основной аудио файл (regular)
    if (ncsSong.download.regular) {
      this.logger.log('    📥 Downloading audio file (regular)...')
      const result = await this.downloadAudio(
        ncsSong.download.regular,
        `${sanitizedTitle}_${trackId}.mp3`,
      )
      if (result) {
        this.logger.log('    ✅ Regular version saved')
        audioFilePath = result.filePath
        audioSize = result.size
      }
    }

    // Если regular нет, пробуем preview
    if (!audioFilePath && ncsSong.previewUrl) {
      this.logger.log('    📥 Downloading preview...')
      const result = await this.downloadAudio(
        ncsSong.previewUrl,
        `${sanitizedTitle}_${trackId}_preview.mp3`,
      )
      if (result) {
        audioFilePath = result.filePath
        audioSize = result.size
      } else {
        // Внешняя ссылка намеренно НЕ подставляется: трек без локального файла
        // не проходит дальше — createTrack бросит 'No audio URL available',
        // и песня будет пропущена. Так в базу не попадают строки без аудио.
        this.logger.warn('    ⚠️  Preview download failed — track will be skipped')
      }
    }

    // Скачиваем instrumental версию
    let instrumentalFilePath: string | null = null
    if (ncsSong.download.instrumental) {
      this.logger.log('    📥 Downloading instrumental version...')
      const result = await this.downloadAudio(
        ncsSong.download.instrumental,
        `${sanitizedTitle}_${trackId}_instrumental.mp3`,
      )
      if (result) {
        this.logger.log('    ✅ Instrumental version saved')
        instrumentalFilePath = result.filePath
        instrumentalSize = result.size
      }
    }

    // Длительность намеренно не возвращается: её читает TracksService.create
    // из самого аудиофайла. Раньше здесь стояло случайное число 180-300 с,
    // которым сидер затирал уже посчитанное значение — треки расходились
    // с реальностью на две с половиной минуты.
    return {
      audioFilePath,
      coverBuffer,
      instrumentalFilePath,
      audioSize,
      instrumentalSize,
    }
  }
}
