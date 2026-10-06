import { verifySignedStorageToken } from '@infra/storage/signed-storage-token'
import { describe, expect, it } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import { S3Service } from './s3.service'

const S3_ENDPOINT = 'http://seaweedfs.internal:8333'
const API_BASE_URL = 'https://api.bitrate.test'
const JWT_SECRET = 'unit-test-secret-value'

function buildService(): S3Service {
  const values: Record<string, unknown> = {
    s3: {
      endpoint: S3_ENDPOINT,
      region: 'us-east-1',
      bucket: 'bitrate-audio',
      accessKey: 'access',
      secretKey: 'secret',
      publicUrl: 'https://cdn.example.test',
      forcePathStyle: true,
    },
    JWT_SECRET,
    API_BASE_URL,
  }
  const config = {
    getOrThrow: (key: string) => values[key],
    get: (key: string) => values[key],
  } as unknown as ConfigService<never>
  return new S3Service(config)
}

describe('S3Service.getPresignedUrl', () => {
  it('returns a signed token URL on the API, never the object-store endpoint', async () => {
    const url = await buildService().getPresignedUrl('tracks/t1/generations/g/hls/master.m3u8', 600)

    expect(url.startsWith(`${API_BASE_URL}/api/v1/storage/objects/`)).toBe(true)
    expect(url).not.toContain('seaweedfs.internal')
    expect(url).not.toContain('8333')
    expect(url).not.toContain('cdn.example.test')
  })

  it('embeds a token that resolves back to the requested key', async () => {
    const key = 'tracks/t1/generations/g/audio/128k.opus'
    const url = await buildService().getPresignedUrl(key)
    const token = decodeURIComponent(url.split('/storage/objects/')[1] as string)

    expect(verifySignedStorageToken(token, JWT_SECRET)).toBe(key)
    expect(verifySignedStorageToken(token, 'another-secret-value')).toBeNull()
  })
})
