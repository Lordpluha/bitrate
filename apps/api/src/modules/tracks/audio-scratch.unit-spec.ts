import { chmod, lstat, mkdir, mkdtemp, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import {
  createJobScratchDir,
  getAudioScratchRoot,
  getJobScratchBase,
  getUploadTempDir,
  removeStaleScratchDirs,
} from './audio-scratch'

const PRIVATE_MODE = 0o700

async function modeOf(path: string) {
  return (await lstat(path)).mode & 0o777
}

describe('audio scratch locations', () => {
  it('defaults to the OS temp directory and honours AUDIO_SCRATCH_ROOT', () => {
    expect(getAudioScratchRoot({})).toBe(tmpdir())
    expect(getAudioScratchRoot({ AUDIO_SCRATCH_ROOT: '/scratch' })).toBe('/scratch')
    expect(getJobScratchBase({ AUDIO_SCRATCH_ROOT: '/scratch' })).toBe(
      '/scratch/bitrate-audio-jobs',
    )
  })
})

describe('private scratch directories', () => {
  let root: string
  let env: NodeJS.ProcessEnv

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'scratch-spec-'))
    env = { AUDIO_SCRATCH_ROOT: root }
  })
  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('creates the upload directory privately with an unpredictable name, once per process', async () => {
    const dir = getUploadTempDir(env)

    expect(dir.startsWith(`${join(root, 'bitrate-audio-uploads')}/`)).toBe(true)
    expect(dir).toMatch(/\/u-[A-Za-z0-9]{6}$/)
    expect(await modeOf(dir)).toBe(PRIVATE_MODE)
    expect(await modeOf(join(root, 'bitrate-audio-uploads'))).toBe(PRIVATE_MODE)
    expect(getUploadTempDir(env)).toBe(dir)
  })

  it('gives every job a different private directory under the jobs base', async () => {
    const first = await createJobScratchDir(getJobScratchBase(env), 'track-1-job-1-1-')
    const second = await createJobScratchDir(getJobScratchBase(env), 'track-1-job-1-1-')

    expect(first).not.toBe(second)
    for (const dir of [first, second]) {
      expect(dir.startsWith(join(root, 'bitrate-audio-jobs', 'track-1-job-1-1-'))).toBe(true)
      expect(await modeOf(dir)).toBe(PRIVATE_MODE)
    }
    expect(await modeOf(getJobScratchBase(env))).toBe(PRIVATE_MODE)
  })

  it('refuses a base that is a symlink', async () => {
    const elsewhere = join(root, 'elsewhere')
    await mkdir(elsewhere)
    await symlink(elsewhere, join(root, 'bitrate-audio-jobs'))

    await expect(createJobScratchDir(getJobScratchBase(env), 'job-')).rejects.toThrow(
      /symlink|directory/i,
    )
    expect(await readdir(elsewhere)).toEqual([])
  })

  it('refuses a pre-existing base that other users can write to', async () => {
    const base = getJobScratchBase(env)
    await mkdir(base)
    await chmod(base, 0o777)

    await expect(createJobScratchDir(base, 'job-')).rejects.toThrow(/writable/i)
  })
})

describe('removeStaleScratchDirs', () => {
  let base: string
  let outside: string

  beforeEach(async () => {
    const root = await mkdtemp(join(tmpdir(), 'scratch-stale-'))
    base = join(root, 'jobs')
    outside = join(root, 'outside')
    await mkdir(base, { mode: PRIVATE_MODE })
    await mkdir(outside)
    await writeFile(join(outside, 'keep.txt'), 'keep')
  })
  afterEach(async () => {
    await rm(join(base, '..'), { recursive: true, force: true })
  })

  it('removes leftover job directories', async () => {
    await mkdir(join(base, 'track-1-1-1-abcdef'), { recursive: true })
    await writeFile(join(base, 'track-1-1-1-abcdef', 'source.mp3'), 'x')

    await removeStaleScratchDirs(base)

    expect(await readdir(base)).toEqual([])
  })

  it('never follows a symlink out of the base', async () => {
    await symlink(outside, join(base, 'sneaky'))

    await removeStaleScratchDirs(base)

    expect(await readdir(outside)).toEqual(['keep.txt'])
  })

  it('tolerates a scratch base that does not exist yet', async () => {
    await expect(removeStaleScratchDirs(join(base, 'absent'))).resolves.toBeUndefined()
  })
})
