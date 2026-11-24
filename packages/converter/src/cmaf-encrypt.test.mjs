import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import ffmpegPath from 'ffmpeg-static'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { convertAudioToCmaf } from './cmaf.mjs'
import { encryptCmafRenditions } from './cmaf-encrypt.mjs'

const KEY_ID = '0123456789abcdef0123456789abcdef'
const KEY = 'fedcba9876543210fedcba9876543210'

/** MD5 of the first seconds of decoded PCM, optionally decrypting with `key`. */
const pcmDigest = (path, key) => {
  const pcm = execFileSync(
    ffmpegPath,
    [
      '-hide_banner',
      '-loglevel',
      'quiet',
      ...(key ? ['-decryption_key', key] : []),
      '-i',
      path,
      '-t',
      '5',
      '-f',
      's16le',
      '-',
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  )
  return createHash('md5').update(pcm).digest('hex')
}

// Real FFmpeg and Shaka Packager binaries: the only way to know the encrypted files still play.
describe('encryptCmafRenditions (real binaries)', () => {
  let work
  let clear
  let encrypted

  beforeAll(async () => {
    work = await fs.mkdtemp(join(tmpdir(), 'cmaf-encrypt-'))
    const tone = join(work, 'tone.wav')
    execFileSync(ffmpegPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=440:duration=35',
      '-ac',
      '2',
      tone,
    ])
    clear = await convertAudioToCmaf({
      input: tone,
      outputDir: join(work, 'clear'),
      bitrates: [128, 192],
    })
    encrypted = await encryptCmafRenditions({
      renditions: clear.renditions,
      outputDir: join(work, 'encrypted'),
      keyId: KEY_ID,
      key: KEY,
      clearBitrates: [128],
    })
  }, 120_000)

  afterAll(async () => {
    if (work) await fs.rm(work, { recursive: true, force: true })
  })

  const encryptedOnly = () => encrypted.renditions.filter((rendition) => rendition.encryption)

  it('keeps the fragment grid of the clear renditions, priming frame aside', () => {
    expect(encrypted.timescale).toBe(clear.timescale)
    // The packager's index counts the encoder's priming frame, which FFmpeg's leaves out; the
    // edit list still trims it on playback (the decoded audio below is identical).
    expect(Math.abs(encrypted.durationTicks - clear.durationTicks)).toBeLessThanOrEqual(1024)
    for (const rendition of encrypted.renditions) {
      const source = clear.renditions.find(({ bitrate }) => bitrate === rendition.bitrate)
      expect(rendition.fragments).toHaveLength(source.fragments.length)
    }
  })

  it('packages a clear copy on the same grid as the encrypted renditions', () => {
    const clearCopy = encrypted.renditions.find((rendition) => rendition.encryption === null)
    expect(clearCopy).toMatchObject({ bitrate: 128 })
    expect(clearCopy.path).not.toBe(clear.renditions[0].path)
    expect(clearCopy.fragments.map((fragment) => fragment.durationTicks)).toEqual(
      encryptedOnly()[0].fragments.map((fragment) => fragment.durationTicks),
    )
    const bytes = execFileSync(
      ffmpegPath,
      ['-hide_banner', '-v', 'error', '-i', clearCopy.path, '-f', 'null', '-'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    expect(bytes).toBe('')
    expect(pcmDigest(clearCopy.path)).toBe(pcmDigest(clear.renditions[0].path))
  })

  it('removes the scratch copies it packaged the clear renditions from', async () => {
    const names = await fs.readdir(join(work, 'encrypted'))
    expect(names.sort()).toEqual(['128-clear.m4a', '128.m4a', '192.m4a'])
  })

  it('indexes the encrypted files, whose fragments grow by the encryption boxes', () => {
    for (const rendition of encryptedOnly()) {
      const source = clear.renditions.find(({ bitrate }) => bitrate === rendition.bitrate)
      expect(rendition.size).toBeGreaterThan(source.size)
      expect(rendition.fragments[0].offset).toBeGreaterThan(rendition.initRange[1])
    }
  })

  it('declares cbcs with the key id in the init segment, with no clear lead', async () => {
    for (const rendition of encryptedOnly()) {
      const bytes = await fs.readFile(rendition.path)
      const init = bytes.subarray(0, rendition.initRange[1] + 1)
      expect(init.includes(Buffer.from('cbcs'))).toBe(true)
      expect(init.includes(Buffer.from('tenc'))).toBe(true)
      expect(init.includes(Buffer.from(KEY_ID, 'hex'))).toBe(true)
      expect(init.includes(Buffer.from('pssh'))).toBe(true)
      expect(rendition.encryption).toEqual({ scheme: 'cbcs', keyId: KEY_ID })
    }
  })

  it('decrypts with the key to the same audio, and does not without it', () => {
    const [source] = clear.renditions
    const [rendition] = encryptedOnly()
    const reference = pcmDigest(source.path)

    expect(pcmDigest(rendition.path, KEY)).toBe(reference)
    // Without the key FFmpeg either refuses the encrypted samples or decodes noise.
    const withoutKey = (() => {
      try {
        return pcmDigest(rendition.path)
      } catch {
        return 'refused'
      }
    })()
    expect(withoutKey).not.toBe(reference)
  })

  it('rejects a key or key id that is not 16 bytes of hex', async () => {
    await expect(
      encryptCmafRenditions({
        renditions: clear.renditions,
        outputDir: join(work, 'bad'),
        keyId: 'short',
        key: KEY,
      }),
    ).rejects.toThrow('keyId must be 32 hex characters')
    await expect(
      encryptCmafRenditions({
        renditions: clear.renditions,
        outputDir: join(work, 'bad'),
        keyId: KEY_ID,
        key: 'zz'.repeat(16),
      }),
    ).rejects.toThrow('key must be 32 hex characters')
  })
})
