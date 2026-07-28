import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, rm, stat } from 'node:fs/promises'
import type { AppConfig } from '@common/config'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import { LocalStorageService } from './local-storage.service'
import { verifySignedStorageToken } from './signed-storage-token'

jest.mock('node:fs', () => ({
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
}))

jest.mock('node:fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(),
  rm: jest.fn(),
  stat: jest.fn(),
}))

const createReadStreamMock = createReadStream as jest.MockedFunction<typeof createReadStream>
const createWriteStreamMock = createWriteStream as jest.MockedFunction<typeof createWriteStream>
const accessMock = access as jest.MockedFunction<typeof access>
const mkdirMock = mkdir as jest.MockedFunction<typeof mkdir>
const rmMock = rm as jest.MockedFunction<typeof rm>
const statMock = stat as jest.MockedFunction<typeof stat>

const TEST_SECRET = 'test-secret'

const makeConfigMock = () =>
  ({
    getOrThrow: jest.fn((key: string) => {
      if (key === 'storage') {
        return { getPrivateRoot: (path?: string) => `/storage/private/${path ?? ''}` }
      }
      if (key === 'JWT_SECRET') return TEST_SECRET
      throw new Error(`Unexpected config key: ${key}`)
    }),
    get: jest.fn().mockReturnValue(undefined),
  }) as unknown as jest.Mocked<ConfigService<AppConfig>>

describe('LocalStorageService', () => {
  let service: LocalStorageService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new LocalStorageService(makeConfigMock())
  })

  describe('getObjectStream', () => {
    it('returns the full file when no Range is requested', async () => {
      statMock.mockResolvedValue({ size: 2048 } as never)
      createReadStreamMock.mockReturnValue({ pipe: jest.fn() } as never)

      const result = await service.getObjectStream('tracks/t1/audio/192k.opus')

      expect(result.contentLength).toBe(2048)
      expect(result.contentType).toBe('audio/ogg')
      expect(result.contentRange).toBeUndefined()
      expect(createReadStreamMock).toHaveBeenCalledWith(
        expect.stringContaining('tracks/t1/audio/192k.opus'),
      )
    })

    it('returns a concrete byte range when a Range header is given', async () => {
      statMock.mockResolvedValue({ size: 1000 } as never)
      createReadStreamMock.mockReturnValue({ pipe: jest.fn() } as never)

      const result = await service.getObjectStream('tracks/t1/hls/128/index.m3u8', 'bytes=100-199')

      expect(result.contentLength).toBe(100)
      expect(result.contentRange).toBe('bytes 100-199/1000')
      expect(createReadStreamMock).toHaveBeenLastCalledWith(expect.any(String), {
        start: 100,
        end: 199,
      })
    })

    it('resolves a suffix range relative to the end of the file', async () => {
      statMock.mockResolvedValue({ size: 1000 } as never)
      createReadStreamMock.mockReturnValue({ pipe: jest.fn() } as never)

      const result = await service.getObjectStream('tracks/t1/hls/master.m3u8', 'bytes=-100')

      expect(result.contentRange).toBe('bytes 900-999/1000')
    })

    it('serves HLS assets (segments, init files, playlists) the same way as any other key', async () => {
      statMock.mockResolvedValue({ size: 512 } as never)
      createReadStreamMock.mockReturnValue({ pipe: jest.fn() } as never)

      const segment = await service.getObjectStream('tracks/t1/hls/128/segment_00000.m4s')
      const init = await service.getObjectStream('tracks/t1/hls/128/init_0.mp4')
      const playlist = await service.getObjectStream('tracks/t1/hls/128/index.m3u8')

      expect(segment.contentType).toBe('video/iso.segment')
      expect(init.contentType).toBe('video/mp4')
      expect(playlist.contentType).toBe('application/vnd.apple.mpegurl')
    })

    it('rejects a key that attempts path traversal outside the storage root', async () => {
      await expect(service.getObjectStream('../../etc/passwd')).rejects.toThrow(
        'Invalid storage key',
      )
    })
  })

  describe('upload', () => {
    it('creates parent directories and writes a buffer to the resolved path', async () => {
      mkdirMock.mockResolvedValue(undefined as never)
      const fakeWriteStream = {
        on: jest.fn((...args: unknown[]) => {
          const [event, cb] = args as [string, () => void]
          if (event === 'finish') cb()
          return fakeWriteStream
        }),
        end: jest.fn(),
      }
      createWriteStreamMock.mockReturnValue(fakeWriteStream as never)

      const key = await service.upload(
        'tracks/t1/audio/128k.opus',
        Buffer.from('data'),
        'audio/ogg',
      )

      expect(key).toBe('tracks/t1/audio/128k.opus')
      expect(mkdirMock).toHaveBeenCalledWith(expect.any(String), { recursive: true })
      expect(fakeWriteStream.end).toHaveBeenCalledWith(Buffer.from('data'))
    })
  })

  describe('getObjectMeta', () => {
    it('returns size and content type without opening a stream', async () => {
      statMock.mockResolvedValue({ size: 4096 } as never)

      const meta = await service.getObjectMeta('tracks/t1/hls/master.m3u8')

      expect(meta).toEqual({ contentLength: 4096, contentType: 'application/vnd.apple.mpegurl' })
      expect(createReadStreamMock).not.toHaveBeenCalled()
    })
  })

  describe('deleteObject', () => {
    it('force-removes the resolved file', async () => {
      rmMock.mockResolvedValue(undefined as never)

      await service.deleteObject('tracks/t1/audio/128k.opus')

      expect(rmMock).toHaveBeenCalledWith(expect.any(String), { force: true })
    })
  })

  describe('deletePrefix', () => {
    it('recursively removes every object under the prefix', async () => {
      rmMock.mockResolvedValue(undefined as never)

      await service.deletePrefix('tracks/t1/')

      expect(rmMock).toHaveBeenCalledWith(expect.any(String), { recursive: true, force: true })
    })
  })

  describe('exists', () => {
    it('returns true when the file is accessible', async () => {
      accessMock.mockResolvedValue(undefined as never)

      await expect(service.exists('tracks/t1/audio/128k.opus')).resolves.toBe(true)
    })

    it('returns false when the file is missing', async () => {
      accessMock.mockRejectedValue(new Error('ENOENT') as never)

      await expect(service.exists('tracks/t1/audio/128k.opus')).resolves.toBe(false)
    })
  })

  describe('getPresignedUrl', () => {
    it('returns a signed URL whose token resolves back to the original key', async () => {
      const url = await service.getPresignedUrl('tracks/t1/audio/128k.opus', 3600)

      expect(url).toMatch(/^http:\/\/localhost:3000\/storage\/objects\//)
      const token = decodeURIComponent(url.split('/storage/objects/')[1] ?? '')
      expect(verifySignedStorageToken(token, TEST_SECRET)).toBe('tracks/t1/audio/128k.opus')
    })

    it('rejects an expired token', async () => {
      const url = await service.getPresignedUrl('tracks/t1/audio/128k.opus', -1)
      const token = decodeURIComponent(url.split('/storage/objects/')[1] ?? '')

      expect(verifySignedStorageToken(token, TEST_SECRET)).toBeNull()
    })
  })
})
