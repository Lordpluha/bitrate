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
    destination: './uploads',
    path: './uploads/generated.png',
    stream: null as never,
    buffer: Buffer.from(''),
    ...overrides,
  }) as Express.Multer.File

describe('resolveSafeMulterPath', () => {
  it('joins the caller-supplied directory with the generated filename', () => {
    const file = buildFile()

    expect(resolveSafeMulterPath(file, './uploads')).toBe('uploads/generated.png')
  })

  it('ignores the path the upload arrived with, using only the directory it is given', () => {
    const file = buildFile({ path: './somewhere/else/generated.png' })

    expect(resolveSafeMulterPath(file, './uploads')).toBe('uploads/generated.png')
  })

  it('rejects a generated filename that would escape its directory', () => {
    const file = buildFile({
      filename: '../../etc/passwd',
      path: './uploads/../../etc/passwd',
    })

    expect(() => resolveSafeMulterPath(file, './uploads')).toThrow(BadRequestException)
  })
})
