import type { Readable } from 'node:stream'

/** A readable object stream with metadata mirrored from the underlying HTTP response. */
export type StorageObjectStream = {
  stream: Readable
  contentLength?: number
  contentType?: string
  contentRange?: string
}

/** Object metadata without its body. */
export type StorageObjectMeta = {
  contentLength?: number
  contentType?: string
}

/**
 * Storage driver abstraction bound to the STORAGE_SERVICE token.
 * Implemented by S3Service (STORAGE_DRIVER=s3) and LocalStorageService
 * (STORAGE_DRIVER=local) — both preserve identical Range and HLS-asset behavior.
 */
export interface StorageService {
  /** Uploads a buffer or readable stream under `key`, returning the stored key. */
  upload(key: string, body: Buffer | Readable, contentType: string): Promise<string>

  /**
   * Returns a time-limited direct-access URL for the object.
   * The S3 driver returns a presigned URL pointing at the S3 endpoint directly;
   * the local driver returns a signed URL pointing back at this API's own storage route.
   */
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>

  /** Returns the object as a stream, honoring an optional `bytes=start-end` Range. */
  getObjectStream(key: string, range?: string): Promise<StorageObjectStream>

  /** Returns object metadata without downloading its body. */
  getObjectMeta(key: string): Promise<StorageObjectMeta>

  /** Deletes a single object. */
  deleteObject(key: string): Promise<void>

  /** Deletes every object whose key starts with `prefix`. */
  deletePrefix(prefix: string): Promise<void>

  /** Checks whether an object exists. */
  exists(key: string): Promise<boolean>
}
