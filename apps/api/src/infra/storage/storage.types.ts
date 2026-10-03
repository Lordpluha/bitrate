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
 * Object storage abstraction bound to the STORAGE_SERVICE token.
 * Implemented by S3Service, which talks to the S3-compatible object store.
 */
export interface StorageService {
  /** Verifies that the selected storage backend is reachable. */
  healthCheck(): Promise<boolean>

  /** Uploads a buffer or readable stream under `key`, returning the stored key. */
  upload(key: string, body: Buffer | Readable, contentType: string): Promise<string>

  /**
   * Returns a time-limited, signed URL for the object on this API's own storage route.
   * Both drivers return the same shape; the object store's endpoint is never exposed.
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
