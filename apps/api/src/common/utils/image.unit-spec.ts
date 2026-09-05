import { describe, expect, it } from '@jest/globals'
import { detectAllowedImageMime, isAllowedImageBuffer } from './image'

describe('image magic-byte validation', () => {
  it.each([
    [Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'image/png'],
    [Buffer.from([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg'],
    [Buffer.from('GIF89a', 'ascii'), 'image/gif'],
    [Buffer.from('RIFF0000WEBP', 'ascii'), 'image/webp'],
  ])('detects an allowlisted format from content', (header, mime) => {
    expect(detectAllowedImageMime(header)).toBe(mime)
    expect(isAllowedImageBuffer(header)).toBe(true)
  })

  it('rejects HTML even when the client labels it as an image', () => {
    const header = Buffer.from('<script>ale', 'ascii')

    expect(detectAllowedImageMime(header)).toBeNull()
    expect(isAllowedImageBuffer(header)).toBe(false)
  })
})
