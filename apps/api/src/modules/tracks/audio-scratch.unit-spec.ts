import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import {
  getAudioScratchRoot,
  getJobScratchBase,
  getUploadTempDir,
  removeStaleScratchDirs,
} from './audio-scratch'

describe('audio scratch locations', () => {
  it('defaults to the OS temp directory and honours AUDIO_SCRATCH_ROOT', () => {
    expect(getAudioScratchRoot({})).toBe(tmpdir())
    expect(getAudioScratchRoot({ AUDIO_SCRATCH_ROOT: '/scratch' })).toBe('/scratch')
    expect(getJobScratchBase({ AUDIO_SCRATCH_ROOT: '/scratch' })).toBe(
      '/scratch/bitrate-audio-jobs',
    )
  })

  it('keeps upload temp files outside the storage root', () => {
    const dir = getUploadTempDir({ AUDIO_SCRATCH_ROOT: '/scratch' })
    expect(dir).toBe('/scratch/bitrate-audio-uploads')
    expect(dir).not.toContain('storage')
  })
})

describe('removeStaleScratchDirs', () => {
  let base: string

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'scratch-spec-'))
  })
  afterEach(async () => {
    await rm(base, { recursive: true, force: true })
  })

  it('removes every leftover job directory', async () => {
    await mkdir(join(base, 'jobs', 'track-1-1-1'), { recursive: true })
    await writeFile(join(base, 'jobs', 'track-1-1-1', 'source.mp3'), 'x')
    await mkdir(join(base, 'jobs', 'track-2-2-1'), { recursive: true })

    await removeStaleScratchDirs(join(base, 'jobs'))

    expect(await readdir(join(base, 'jobs'))).toEqual([])
  })

  it('tolerates a scratch base that does not exist yet', async () => {
    await expect(removeStaleScratchDirs(join(base, 'absent'))).resolves.toBeUndefined()
  })
})
