import { describe, expect, it } from '@jest/globals'
import { createMulterFileFromBuffer } from './file-helper'

describe('createMulterFileFromBuffer', () => {
  it('builds an in-memory cover whose MIME type comes from the image bytes', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

    const file = createMulterFileFromBuffer(png, 'cover')

    expect(file).toMatchObject({ fieldname: 'cover', mimetype: 'image/png', size: png.length })
    expect(file.buffer).toBe(png)
    expect(file.path).toBeUndefined()
  })

  it('leaves the MIME type unrecognised for non-image bytes so upload validation rejects it', () => {
    const file = createMulterFileFromBuffer(Buffer.from('<html>'), 'cover')

    expect(file.mimetype).toBe('application/octet-stream')
  })
})
