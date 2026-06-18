import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ──────────────────────────────────────────────────────────
const fsMocks = vi.hoisted(() => ({
  access: vi.fn(),
  stat: vi.fn(),
}))

const sharpMocks = vi.hoisted(() => ({
  toFile: vi.fn(),
  webp: vi.fn(),
  sharp: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({ default: fsMocks }))
vi.mock('sharp', () => ({ default: sharpMocks.sharp }))

// ── Import under test ──────────────────────────────────────────────────────
import { convertImage } from './image.mjs'

beforeEach(() => {
  vi.clearAllMocks()
  fsMocks.access.mockResolvedValue(undefined)
  fsMocks.stat.mockResolvedValue({ size: 1024 * 1024 })
  // Set up the sharp() chain: sharp(input).webp({...}).toFile(path)
  sharpMocks.toFile.mockResolvedValue({})
  sharpMocks.webp.mockReturnValue({ toFile: sharpMocks.toFile })
  sharpMocks.sharp.mockReturnValue({ webp: sharpMocks.webp })
})

// ── Tests ──────────────────────────────────────────────────────────────────
describe('convertImage', () => {
  describe('input validation', () => {
    it('throws when the input file does not exist', async () => {
      fsMocks.access.mockRejectedValueOnce(new Error('ENOENT'))
      await expect(convertImage({ input: '/missing.png' })).rejects.toThrow(
        'Input file not found: /missing.png',
      )
    })

    it('throws for quality below 1', async () => {
      await expect(convertImage({ input: '/a.png', quality: 0 })).rejects.toThrow(
        'Quality must be between 1 and 100',
      )
    })

    it('throws for quality above 100', async () => {
      await expect(convertImage({ input: '/a.png', quality: 101 })).rejects.toThrow(
        'Quality must be between 1 and 100',
      )
    })

    it('accepts quality at boundary values 1 and 100', async () => {
      await expect(convertImage({ input: '/a.png', quality: 1 })).resolves.toBeDefined()
      await expect(convertImage({ input: '/a.png', quality: 100 })).resolves.toBeDefined()
    })
  })

  describe('output path derivation', () => {
    it('replaces the extension with .webp when no output is given', async () => {
      const result = await convertImage({ input: '/images/photo.jpg' })
      expect(result.output).toBe('/images/photo.webp')
    })

    it('replaces any extension, not just .jpg', async () => {
      const result = await convertImage({ input: '/img.png' })
      expect(result.output).toBe('/img.webp')
    })

    it('uses the provided output path verbatim', async () => {
      const result = await convertImage({ input: '/a.png', output: '/custom/out.webp' })
      expect(result.output).toBe('/custom/out.webp')
    })
  })

  describe('sharp usage', () => {
    it('calls sharp with the input path', async () => {
      await convertImage({ input: '/photo.png' })
      expect(sharpMocks.sharp).toHaveBeenCalledWith('/photo.png')
    })

    it('calls .webp() with the given quality', async () => {
      await convertImage({ input: '/a.png', quality: 60 })
      expect(sharpMocks.webp).toHaveBeenCalledWith(expect.objectContaining({ quality: 60 }))
    })

    it('calls .webp() with lossless: false by default', async () => {
      await convertImage({ input: '/a.png' })
      expect(sharpMocks.webp).toHaveBeenCalledWith(expect.objectContaining({ lossless: false }))
    })

    it('calls .webp() with lossless: true when requested', async () => {
      await convertImage({ input: '/a.png', lossless: true })
      expect(sharpMocks.webp).toHaveBeenCalledWith(expect.objectContaining({ lossless: true }))
    })

    it('calls .toFile() with the output path', async () => {
      await convertImage({ input: '/a.png', output: '/b.webp' })
      expect(sharpMocks.toFile).toHaveBeenCalledWith('/b.webp')
    })

    it('uses the default quality of 80 when not specified', async () => {
      await convertImage({ input: '/a.png' })
      expect(sharpMocks.webp).toHaveBeenCalledWith(expect.objectContaining({ quality: 80 }))
    })
  })

  describe('return value', () => {
    it('returns the input and output paths', async () => {
      const result = await convertImage({ input: '/a.png', output: '/b.webp' })
      expect(result.input).toBe('/a.png')
      expect(result.output).toBe('/b.webp')
    })

    it('returns inputSize and outputSize as human-readable strings', async () => {
      fsMocks.stat
        .mockResolvedValueOnce({ size: 4 * 1024 * 1024 }) // input: 4 MB
        .mockResolvedValueOnce({ size: 512 * 1024 }) // output: 512 KB

      const result = await convertImage({ input: '/a.png' })
      expect(result.inputSize).toBe('4 MB')
      expect(result.outputSize).toBe('512 KB')
    })
  })

  describe('formatBytes (via return value)', () => {
    const cases = [
      [0, '0 B'],
      [1024, '1 KB'],
      [1024 * 1024, '1 MB'],
      [1024 * 1024 * 1024, '1 GB'],
    ]

    for (const [size, label] of cases) {
      it(`formats ${size} bytes as "${label}"`, async () => {
        fsMocks.stat.mockResolvedValueOnce({ size }).mockResolvedValueOnce({ size })

        const result = await convertImage({ input: '/a.png' })
        expect(result.inputSize).toBe(label)
      })
    }
  })
})
