import { constants, createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, rm, stat } from 'node:fs/promises'
import { dirname, extname, normalize, resolve, sep } from 'node:path'
import type { Readable } from 'node:stream'
import type { AppConfig } from '@common/config'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createSignedStorageToken } from './signed-storage-token'
import type { StorageObjectMeta, StorageObjectStream, StorageService } from './storage.types'

/** MIME types derived from a key's extension — local storage has no object-metadata store. */
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.opus': 'audio/ogg',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'audio/webm',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.mp4': 'video/mp4',
  '.m4s': 'video/iso.segment',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** A concrete byte range resolved from an HTTP Range header. */
type ByteRange = { start: number; end: number }

/**
 * Local-filesystem StorageService implementation, rooted at storage/private/objects.
 * A "key" maps 1:1 to a path under this root, mirroring how S3Service treats a key
 * as a path within its bucket — Range requests and HLS asset keys behave identically.
 */
@Injectable()
export class LocalStorageService implements StorageService {
  /** Verifies that the local object root can be accessed. */
  async healthCheck(): Promise<boolean> {
    await mkdir(this.root, { recursive: true })
    await access(this.root, constants.R_OK | constants.W_OK)
    return true
  }
  /** The root value. */
  private readonly root: string
  /** The jwt secret value. */
  private readonly jwtSecret: string
  /** The api base url value. */
  private readonly apiBaseUrl: string

  /** Creates a new instance. */
  constructor(config: ConfigService<AppConfig>) {
    this.root = config.getOrThrow('storage').getPrivateRoot('objects')
    this.jwtSecret = config.getOrThrow('JWT_SECRET')
    this.apiBaseUrl = config.get('API_BASE_URL') ?? 'http://localhost:3000'
  }

  /** Resolves a storage key to an absolute path, rejecting traversal outside the root. */
  private resolvePath(key: string): string {
    const target = resolve(this.root, normalize(key))
    if (target !== this.root && !target.startsWith(this.root + sep)) {
      throw new Error(`Invalid storage key: ${key}`)
    }
    return target
  }

  /** Returns the MIME type for a key based on its extension. */
  private contentTypeFor(key: string): string {
    return CONTENT_TYPE_BY_EXTENSION[extname(key).toLowerCase()] ?? 'application/octet-stream'
  }

  /** Parses an HTTP Range header (`bytes=start-end`, open-ended, or suffix forms). */
  private parseRange(range: string, fileSize: number): ByteRange | null {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (!(match && (match[1] || match[2]))) return null

    if (!match[1] && match[2]) {
      const suffixLength = Number.parseInt(match[2], 10)
      return { start: Math.max(0, fileSize - suffixLength), end: fileSize - 1 }
    }

    const start = match[1] ? Number.parseInt(match[1], 10) : 0
    const end = Math.min(match[2] ? Number.parseInt(match[2], 10) : fileSize - 1, fileSize - 1)
    return { start, end }
  }

  /** Writes a buffer or stream to the resolved key path, creating parent directories. */
  async upload(key: string, body: Buffer | Readable, _contentType: string): Promise<string> {
    const path = this.resolvePath(key)
    await mkdir(dirname(path), { recursive: true })

    await new Promise<void>((resolvePromise, reject) => {
      const destination = createWriteStream(path)
      destination.on('finish', () => resolvePromise())
      destination.on('error', reject)
      if (Buffer.isBuffer(body)) {
        destination.end(body)
      } else {
        body.on('error', reject)
        body.pipe(destination)
      }
    })

    return key
  }

  /**
   * Returns a signed URL back to this API's own storage route (HMAC-signed, time-limited).
   * Unlike an S3 presigned URL, this never points at an external endpoint.
   */
  getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const token = createSignedStorageToken(key, expiresIn, this.jwtSecret)
    return Promise.resolve(`${this.apiBaseUrl}/api/v1/storage/objects/${encodeURIComponent(token)}`)
  }

  /** Returns a local file as a Readable stream, honoring an optional byte Range. */
  async getObjectStream(key: string, range?: string): Promise<StorageObjectStream> {
    const path = this.resolvePath(key)
    const stats = await stat(path)
    const contentType = this.contentTypeFor(key)
    const bounds = range ? this.parseRange(range, stats.size) : null

    if (!bounds) {
      return { stream: createReadStream(path), contentLength: stats.size, contentType }
    }

    return {
      stream: createReadStream(path, { start: bounds.start, end: bounds.end }),
      contentLength: bounds.end - bounds.start + 1,
      contentType,
      contentRange: `bytes ${bounds.start}-${bounds.end}/${stats.size}`,
    }
  }

  /** Returns local file metadata without opening a stream. */
  async getObjectMeta(key: string): Promise<StorageObjectMeta> {
    const stats = await stat(this.resolvePath(key))
    return { contentLength: stats.size, contentType: this.contentTypeFor(key) }
  }

  /** Deletes a single local object, ignoring a missing file. */
  async deleteObject(key: string): Promise<void> {
    await rm(this.resolvePath(key), { force: true })
  }

  /** Recursively deletes every local object under a key prefix. */
  async deletePrefix(prefix: string): Promise<void> {
    await rm(this.resolvePath(prefix), { recursive: true, force: true })
  }

  /** Checks whether a local object exists. */
  async exists(key: string): Promise<boolean> {
    try {
      await access(this.resolvePath(key))
      return true
    } catch {
      return false
    }
  }
}
