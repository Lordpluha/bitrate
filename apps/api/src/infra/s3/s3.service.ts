import { Readable } from 'node:stream'
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { AppConfig } from '@common/config'
import type {
  StorageObjectMeta,
  StorageObjectStream,
  StorageService,
} from '@infra/storage/storage.types'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/** Provides S3-compatible object storage operations (the STORAGE_DRIVER=s3 StorageService). */
@Injectable()
export class S3Service implements StorageService {
  /** The logger value. */
  private readonly logger = new Logger(S3Service.name, { timestamp: true })
  /** The client value. */
  private readonly client: S3Client
  /** The bucket value. */
  private readonly bucket: string

  /** Creates a new instance. */
  constructor(config: ConfigService<AppConfig>) {
    const s3 = config.getOrThrow('s3')
    this.bucket = s3.bucket
    this.client = new S3Client({
      endpoint: s3.endpoint,
      region: s3.region,
      credentials: {
        accessKeyId: s3.accessKey,
        secretAccessKey: s3.secretKey,
      },
      forcePathStyle: s3.forcePathStyle,
    })
  }

  /** Verifies that the configured bucket is reachable. */
  async healthCheck(): Promise<boolean> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    return true
  }

  /**
   * Uploads a buffer or readable stream to S3.
   * @param key Object key (path) in the bucket.
   * @param body File content.
   * @param contentType MIME type.
   * @returns The S3 key of the uploaded object.
   */
  async upload(key: string, body: Buffer | Readable, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
    return key
  }

  /**
   * Generates a presigned GET URL valid for the given duration.
   * @param key S3 object key.
   * @param expiresIn Validity period in seconds (default 3600).
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      {
        expiresIn,
      },
    )
  }

  /**
   * Returns an S3 object as a Node.js Readable stream.
   * @param key S3 object key.
   */
  async getObjectStream(key: string, range?: string): Promise<StorageObjectStream> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: range }),
    )
    return {
      stream: response.Body as Readable,
      contentLength: response.ContentLength,
      contentType: response.ContentType,
      contentRange: response.ContentRange,
    }
  }

  /**
   * Returns S3 object metadata without downloading the body.
   * Uses GetObject with a no-op range to get headers cheaply.
   */
  async getObjectMeta(key: string): Promise<StorageObjectMeta> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: 'bytes=0-0' }),
    )
    response.Body?.transformToWebStream().cancel()
    return {
      contentLength: response.ContentRange
        ? Number(response.ContentRange.split('/')[1])
        : response.ContentLength,
      contentType: response.ContentType,
    }
  }

  /**
   * Deletes a single object from S3.
   * @param key S3 object key.
   */
  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    this.logger.debug(`Deleted S3 object: ${key}`)
  }

  /**
   * Deletes all objects whose keys start with the given prefix.
   * @param prefix Key prefix (e.g. "tracks/abc123/").
   */
  async deletePrefix(prefix: string): Promise<void> {
    let continuationToken: string | undefined

    do {
      const listed = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      )

      if (listed.Contents?.length) {
        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
              Objects: listed.Contents.map(({ Key }) => ({ Key: Key as string })),
              Quiet: true,
            },
          }),
        )
      }

      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined
    } while (continuationToken)

    this.logger.debug(`Deleted all S3 objects under prefix: ${prefix}`)
  }

  /**
   * Checks whether an object exists in S3.
   * @param key S3 object key.
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: 'bytes=0-0' }),
      )
      return true
    } catch {
      return false
    }
  }
}
