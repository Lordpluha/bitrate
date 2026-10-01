import { readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Root for local working files of the audio pipeline. `AUDIO_SCRATCH_ROOT` points it at the
 * on-disk `worker_tmp` volume in production; otherwise it is the OS temp directory.
 * Read from the environment directly so it works at decoration time, before DI exists.
 */
export function getAudioScratchRoot(env: NodeJS.ProcessEnv = process.env): string {
  return env.AUDIO_SCRATCH_ROOT || tmpdir()
}

/** Where Multer writes an uploaded master before it is moved to storage — never the storage root. */
export function getUploadTempDir(env: NodeJS.ProcessEnv = process.env): string {
  return join(getAudioScratchRoot(env), 'bitrate-audio-uploads')
}

/** Parent of every per-job scratch directory. */
export function getJobScratchBase(env: NodeJS.ProcessEnv = process.env): string {
  return join(getAudioScratchRoot(env), 'bitrate-audio-jobs')
}

/**
 * Removes every per-job scratch directory left behind by a crashed run. Called once at
 * start-up, before any job is claimed, so nothing in the directory can be in use.
 */
export async function removeStaleScratchDirs(base: string): Promise<void> {
  let entries: string[]
  try {
    entries = await readdir(base)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  await Promise.all(entries.map((entry) => rm(join(base, entry), { recursive: true, force: true })))
}
