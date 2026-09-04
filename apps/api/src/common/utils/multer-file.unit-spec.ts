import { describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { resolveSafeMulterPath } from './multer-file'

const buildFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'original.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    filename: 'generated.png',
    destination: './storage/public/uploads',
    path: './storage/public/uploads/generated.png',
    stream: null as never,
    buffer: Buffer.from(''),
    ...overrides,
  }) as Express.Multer.File

describe('resolveSafeMulterPath', () => {
  it('reconstructs the path from the file directory and its generated filename', () => {
    const file = buildFile()

    expect(resolveSafeMulterPath(file)).toBe('storage/public/uploads/generated.png')
  })

  it('rejects a generated filename that would escape its directory', () => {
    const file = buildFile({
      filename: '../../etc/passwd',
      path: './storage/public/uploads/../../etc/passwd',
    })

    expect(() => resolveSafeMulterPath(file)).toThrow(BadRequestException)
  })
})
