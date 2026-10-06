import { randomBytes, randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Readable } from 'node:stream'
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { verifySignedStorageToken } from '@infra/storage/signed-storage-token'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { downloadObjectToFile, storeMaster } from '@modules/tracks/audio-master'
import type { ConfigService } from '@nestjs/config'
import { S3Service } from './s3.service'

/**
 * Runs S3Service against a real S3-compatible endpoint (SeaweedFS in CI and in the ADR-0050
 * spike). Point it at one with S3_INT_ENDPOINT, S3_INT_BUCKET, S3_INT_ACCESS_KEY and
 * S3_INT_SECRET_KEY. Without them the suite is skipped locally, but fails under CI so the
 * spec can never be skipped silently there.
 */
const endpoint = process.env.S3_INT_ENDPOINT
const bucket = process.env.S3_INT_BUCKET ?? 'bitrate-audio'
const accessKey = process.env.S3_INT_ACCESS_KEY ?? ''
const secretKey = process.env.S3_INT_SECRET_KEY ?? ''

const suite = endpoint ? describe : describe.skip

/** Collects a readable stream into a single buffer. */
async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Uint8Array))
  return Buffer.concat(chunks)
}

describe('S3Service integration guard', () => {
  it('has an object store configured when running in CI', () => {
    if (process.env.CI) expect(endpoint).toBeTruthy()
  })
})

suite('S3Service (int, real S3-compatible endpoint)', () => {
  const prefix = `int-spec/${randomUUID()}/`
  let service: S3Service
  let rawClient: S3Client

  beforeAll(() => {
    const s3 = {
      endpoint: endpoint as string,
      region: 'us-east-1',
      bucket,
      accessKey,
      secretKey,
      forcePathStyle: true,
    }
    const values: Record<string, unknown> = {
      s3,
      JWT_SECRET: 'int-spec-secret-value',
      API_BASE_URL: 'https://api.bitrate.test',
    }
    const config = {
      getOrThrow: (key: string) => values[key],
      get: (key: string) => values[key],
    } as unknown as ConfigService<never>
    service = new S3Service(config)
    rawClient = new S3Client({
      endpoint: s3.endpoint,
      region: s3.region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    })
  })

  afterAll(async () => {
    await service.deletePrefix(prefix)
    rawClient.destroy()
  })

  it('reports the bucket as reachable', async () => {
    await expect(service.healthCheck()).resolves.toBe(true)
  })

  it('uploads a buffer and returns its key', async () => {
    const key = `${prefix}buffer.bin`
    await expect(
      service.upload(key, Buffer.from('hello'), 'application/octet-stream'),
    ).resolves.toBe(key)
    const { stream } = await service.getObjectStream(key)
    expect((await readAll(stream)).toString()).toBe('hello')
  })

  // A file stream, as the pipeline uploads from disk. The SDK needs a known length, so an
  // arbitrary Readable (e.g. Readable.from) is rejected client-side before reaching any server.
  it('uploads a file stream', async () => {
    const key = `${prefix}stream.bin`
    const payload = randomBytes(256 * 1024)
    const dir = await mkdtemp(join(tmpdir(), 's3-int-'))
    const file = join(dir, 'payload.bin')
    await writeFile(file, payload)
    try {
      await service.upload(key, createReadStream(file), 'audio/mpeg')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
    const { stream, contentType } = await service.getObjectStream(key)
    expect(contentType).toBe('audio/mpeg')
    expect((await readAll(stream)).equals(payload)).toBe(true)
  })

  it('completes a multipart upload', async () => {
    const key = `${prefix}multipart.bin`
    const part1 = randomBytes(5 * 1024 * 1024)
    const part2 = randomBytes(1024)
    const { UploadId } = await rawClient.send(
      new CreateMultipartUploadCommand({ Bucket: bucket, Key: key }),
    )
    const first = await rawClient.send(
      new UploadPartCommand({ Bucket: bucket, Key: key, UploadId, PartNumber: 1, Body: part1 }),
    )
    const second = await rawClient.send(
      new UploadPartCommand({ Bucket: bucket, Key: key, UploadId, PartNumber: 2, Body: part2 }),
    )
    await rawClient.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId,
        MultipartUpload: {
          Parts: [
            { ETag: first.ETag, PartNumber: 1 },
            { ETag: second.ETag, PartNumber: 2 },
          ],
        },
      }),
    )
    const object = await rawClient.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const body = await readAll(object.Body as Readable)
    expect(body.equals(Buffer.concat([part1, part2]))).toBe(true)
  })

  it('returns a byte range with Content-Range', async () => {
    const key = `${prefix}range.txt`
    await service.upload(key, Buffer.from('0123456789'), 'text/plain')
    const result = await service.getObjectStream(key, 'bytes=2-5')
    expect(result.contentRange).toBe('bytes 2-5/10')
    expect(result.contentLength).toBe(4)
    expect((await readAll(result.stream)).toString()).toBe('2345')
  })

  it('returns object metadata through HEAD', async () => {
    const key = `${prefix}meta.txt`
    await service.upload(key, Buffer.from('abc'), 'text/plain')
    await expect(service.getObjectMeta(key)).resolves.toEqual({
      contentLength: 3,
      contentType: 'text/plain',
    })
  })

  it('reports existence and deletes a single object', async () => {
    const key = `${prefix}delete-me.txt`
    await service.upload(key, Buffer.from('x'), 'text/plain')
    await expect(service.exists(key)).resolves.toBe(true)
    await service.deleteObject(key)
    await expect(service.exists(key)).resolves.toBe(false)
  })

  it('reports a missing key as absent rather than an error', async () => {
    await expect(service.exists(`${prefix}never-written`)).resolves.toBe(false)
  })

  it('deletes every object under a prefix, across list pages', async () => {
    const base = `${prefix}bulk/`
    const keys = Array.from({ length: 1100 }, (_, i) => `${base}${String(i).padStart(4, '0')}.bin`)
    for (let i = 0; i < keys.length; i += 50) {
      await Promise.all(
        keys.slice(i, i + 50).map((key) => service.upload(key, Buffer.from('1'), 'text/plain')),
      )
    }
    await service.upload(`${prefix}keep.txt`, Buffer.from('k'), 'text/plain')

    await service.deletePrefix(base)

    await expect(service.exists(`${base}0000.bin`)).resolves.toBe(false)
    await expect(service.exists(`${base}1099.bin`)).resolves.toBe(false)
    await expect(service.exists(`${prefix}keep.txt`)).resolves.toBe(true)
  }, 120_000)

  it('hands browsers a signed API URL, never the object-store endpoint', async () => {
    const key = `${prefix}signed.txt`
    await service.upload(key, Buffer.from('signed'), 'text/plain')

    const url = await service.getPresignedUrl(key, 60)

    expect(url.startsWith('https://api.bitrate.test/api/v1/storage/objects/')).toBe(true)
    expect(url).not.toContain(endpoint as string)
    const token = decodeURIComponent(url.split('/storage/objects/')[1] as string)
    expect(verifySignedStorageToken(token, 'int-spec-secret-value')).toBe(key)
  })

  it('round-trips a master: temp file to storage, storage to a scratch file', async () => {
    const key = `${prefix}masters/master.mp3`
    const payload = randomBytes(128 * 1024)
    const dir = await mkdtemp(join(tmpdir(), 's3-master-'))
    const upload = join(dir, 'upload.mp3')
    const scratch = join(dir, 'scratch', 'source.mp3')
    await writeFile(upload, payload)
    try {
      await storeMaster({ storage: service, key, filePath: upload, contentType: 'audio/mpeg' })
      await expect(readFile(upload)).rejects.toThrow()
      await expect(service.getObjectMeta(key)).resolves.toMatchObject({
        contentLength: payload.length,
      })

      await downloadObjectToFile(service, key, scratch)

      expect((await readFile(scratch)).equals(payload)).toBe(true)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
