export const IMAGE_EXTENSION_BY_MIME = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
} as const

export type AllowedImageMime = keyof typeof IMAGE_EXTENSION_BY_MIME

/** Detects an allowlisted image MIME from its magic bytes. */
export function detectAllowedImageMime(buf: Buffer): AllowedImageMime | null {
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  // GIF: GIF87a or GIF89a
  const gifHeader = buf.subarray(0, 6).toString('ascii')
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') return 'image/gif'
  // WebP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp'
  return null
}

/** Checks PNG, JPEG, GIF, or WebP magic bytes in the first 12 bytes of a buffer. */
export function isAllowedImageBuffer(buf: Buffer): boolean {
  return detectAllowedImageMime(buf) !== null
}
