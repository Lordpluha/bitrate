import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { promisify } from 'node:util'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import type { StorageService } from '@infra/storage/storage.types'
import { storeMaster } from '@modules/tracks/audio-master'
import { getUploadTempDir } from '@modules/tracks/audio-scratch'
import { BadRequestException } from '@nestjs/common'
import { ArtistTrackStatus, type Prisma } from '@prisma/client'
import { extractWaveform } from './audio-waveform'
import { RELEASE_ERRORS } from './errors'
import { RELEASE_AUDIO_EXTENSION_BY_MIME } from './release-media.interceptors'

const execFileAsync = promisify(execFile)

/** Longest stored original file name; it is display-only and never part of a storage key. */
const MAX_FILE_NAME_LENGTH = 255

/** ffprobe gets this long before the duration is left unknown instead of failing the upload. */
const PROBE_TIMEOUT_MS = 30_000

/** A new master: uploaded but not yet attached to a draft row. */
export interface StoredMaster {
  key: string
  fileName: string
  contentType: string
  sizeBytes: number
  duration: number | null
  /** Normalised peaks for drawing the waveform; empty when the file could not be decoded. */
  waveform: number[]
}

/** Moves the temporary upload into private storage; the local file is always removed. */
export async function storeReleaseMaster(
  storage: StorageService,
  ownerArtistId: string,
  file: Express.Multer.File | undefined,
): Promise<StoredMaster> {
  if (!file) throw new BadRequestException(RELEASE_ERRORS.AUDIO_FILE_REQUIRED)
  const extension = RELEASE_AUDIO_EXTENSION_BY_MIME[file.mimetype]
  const path = resolveSafeMulterPath(file, getUploadTempDir())
  try {
    if (!extension) throw new BadRequestException(RELEASE_ERRORS.AUDIO_TYPE_INVALID)
    const key = `release-masters/${ownerArtistId}/${randomUUID()}${extension}`
    const [duration, waveform] = await Promise.all([
      probeDurationSeconds(path),
      extractWaveform(path),
    ])
    await storeMaster({ storage, key, filePath: path, contentType: file.mimetype })
    return {
      key,
      fileName: displayFileName(file.originalname),
      contentType: file.mimetype,
      sizeBytes: file.size,
      duration,
      waveform,
    }
  } finally {
    await rm(path, { force: true })
  }
}

/** The draft-row columns that point a recording at a stored master. */
export function masterColumns(master: StoredMaster) {
  return {
    status: ArtistTrackStatus.READY,
    duration: master.duration,
    audioKey: master.key,
    audioFileName: master.fileName,
    audioContentType: master.contentType,
    audioSizeBytes: master.sizeBytes,
    waveform: master.waveform,
  } satisfies Prisma.ArtistTrackDraftUpdateManyMutationInput
}

/**
 * Multer decodes multipart file names as latin1; re-decoding as UTF-8 restores non-ASCII names.
 * Path separators and control characters are dropped because the name is shown back to people.
 */
function displayFileName(originalName: string): string {
  const decoded = Buffer.from(originalName, 'latin1').toString('utf8')
  const cleaned = decoded
    .replace(/[\\/]/g, '_')
    .replace(/\p{Cc}/gu, '')
    .trim()
  return (cleaned || 'audio').slice(0, MAX_FILE_NAME_LENGTH)
}

/** Whole seconds of audio, or null when ffprobe is unavailable or cannot read the file. */
async function probeDurationSeconds(path: string): Promise<number | null> {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path],
      { timeout: PROBE_TIMEOUT_MS },
    )
    const seconds = Number.parseFloat(stdout.trim())
    return Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds) : null
  } catch {
    return null
  }
}
