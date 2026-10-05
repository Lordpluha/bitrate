import { describe, expect, it, jest } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { isPublicAssetKey, storePublicImage } from './public-images'
import type { StorageService } from './storage.types'

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0])
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])

const file = (buffer: Buffer, mimetype: string, size = buffer.length) =>
  ({ buffer, mimetype, size, fieldname: 'cover' }) as unknown as Express.Multer.File

const storageMock = () => {
  const upload = jest.fn().mockImplementation(async (key: unknown) => key as never)
  return { upload, storage: { upload } as unknown as StorageService }
}

describe('storePublicImage', () => {
  it('uploads the validated buffer under <folder>/<uuid><ext> and returns the file name', async () => {
    const { upload, storage } = storageMock()

    const name = await storePublicImage(storage, 'tracks/covers', file(PNG, 'image/png'))

    expect(name).toMatch(/^[0-9a-f-]{36}\.png$/)
    expect(upload).toHaveBeenCalledWith(`tracks/covers/${name}`, PNG, 'image/png')
  })

  it('rejects content that does not match the declared MIME type, uploading nothing', async () => {
    const { upload, storage } = storageMock()

    await expect(
      storePublicImage(storage, 'users/avatars', file(JPEG, 'image/png')),
    ).rejects.toThrow(BadRequestException)
    expect(upload).not.toHaveBeenCalled()
  })

  it('rejects an oversized image, uploading nothing', async () => {
    const { upload, storage } = storageMock()

    await expect(
      storePublicImage(storage, 'users/avatars', file(PNG, 'image/png', 99), { maxBytes: 10 }),
    ).rejects.toThrow(BadRequestException)
    expect(upload).not.toHaveBeenCalled()
  })
})

describe('isPublicAssetKey', () => {
  it.each([
    'tracks/covers/a-b.PNG',
    'users/avatars/x.webp',
    'artists/backgrounds/z.jpeg',
  ])('accepts %s', (key) => expect(isPublicAssetKey(key)).toBe(true))
  it.each([
    '../x.png',
    'tracks/covers/../x.png',
    'tracks/t1/hls/master.m3u8',
    'users/avatars/a.svg',
  ])('rejects %s', (key) => expect(isPublicAssetKey(key)).toBe(false))
})
