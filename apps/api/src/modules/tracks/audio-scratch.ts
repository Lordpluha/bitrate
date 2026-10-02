import { type Dirent, lstatSync, mkdirSync, mkdtempSync } from 'node:fs'
import { lstat, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Directories hold audio in flight, so only their owner may enter them. */
const PRIVATE_DIR_MODE = 0o700

/** Group/other write bits: a base other users can write to lets them swap what lives in it. */
const GROUP_OTHER_WRITE = 0o022

/** Upload temp directory per scratch root, created once per process. */
const uploadDirs = new Map<string, string>()

/**
 * Root for local working files of the audio pipeline. `AUDIO_SCRATCH_ROOT` points it at the
 * on-disk `worker_tmp` volume in production; otherwise it is the OS temp directory.
 * Read from the environment directly so it works at decoration time, before DI exists.
 */
export function getAudioScratchRoot(env: NodeJS.ProcessEnv = process.env): string {
  return env.AUDIO_SCRATCH_ROOT || tmpdir()
}

/** Parent of every per-job scratch directory. */
export function getJobScratchBase(env: NodeJS.ProcessEnv = process.env): string {
  return join(getAudioScratchRoot(env), 'bitrate-audio-jobs')
}

/** Parent of the per-process upload directory. */
function getUploadBase(env: NodeJS.ProcessEnv): string {
  return join(getAudioScratchRoot(env), 'bitrate-audio-uploads')
}

/**
 * Creates `dir` as a private directory, or accepts an existing one only when it is a real
 * directory (not a symlink) owned by this user that others cannot write to. A predictable
 * name under a shared temp directory could otherwise be pre-created or swapped by another
 * local user.
 */
function ensurePrivateDir(dir: string): void {
  mkdirSync(dir, { recursive: true, mode: PRIVATE_DIR_MODE })
  const stats = lstatSync(dir)
  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw new Error(`Refusing scratch base ${dir}: not a plain directory (symlink or file)`)
  }
  if (typeof process.getuid === 'function' && stats.uid !== process.getuid()) {
    throw new Error(`Refusing scratch base ${dir}: owned by another user`)
  }
  if (stats.mode & GROUP_OTHER_WRITE) {
    throw new Error(`Refusing scratch base ${dir}: writable by group or others`)
  }
}

/**
 * The private directory Multer writes uploaded masters into before they move to storage.
 * Created with an unpredictable name (mkdtemp, mode 0o700) once per process.
 */
export function getUploadTempDir(env: NodeJS.ProcessEnv = process.env): string {
  const base = getUploadBase(env)
  const existing = uploadDirs.get(base)
  if (existing) return existing

  ensurePrivateDir(base)
  const dir = mkdtempSync(join(base, 'u-'))
  uploadDirs.set(base, dir)
  return dir
}

/**
 * Creates one job's scratch directory: an unpredictable, owner-only directory (mkdtemp)
 * inside the verified-private `base`. Every file the job writes is derived from the
 * returned path.
 */
export async function createJobScratchDir(base: string, prefix: string): Promise<string> {
  ensurePrivateDir(base)
  return await mkdtemp(join(base, prefix))
}

/**
 * Removes every per-job scratch directory left behind by a crashed run. Called once at
 * start-up, before any job is claimed, so nothing in the directory can be in use.
 * Only real directories owned by this user are removed; symlinks are never followed.
 */
export async function removeStaleScratchDirs(base: string): Promise<void> {
  let entries: Dirent[]
  try {
    entries = await readdir(base, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }

  const uid = typeof process.getuid === 'function' ? process.getuid() : undefined
  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) return
      const path = join(base, entry.name)
      const stats = await lstat(path)
      if (stats.isSymbolicLink() || (uid !== undefined && stats.uid !== uid)) return
      await rm(path, { recursive: true, force: true })
    }),
  )
}
