export interface RunFfmpegOptions {
  ffmpegPath?: string
  timeoutMs?: number
  stderrTailBytes?: number
  onLog?: (message: string) => void
}

export interface RunFfmpegResult {
  durationMs: number
  stderrTail: string
}

export interface FfmpegErrorDetails {
  exitCode: number | null
  signal: string | null
  timedOut: boolean
  stderrTail: string
  args: string[]
  durationMs: number
  cause?: unknown
}

export class FfmpegError extends Error {
  constructor(message: string, details: FfmpegErrorDetails)
  readonly name: 'FfmpegError'
  readonly exitCode: number | null
  readonly signal: string | null
  readonly timedOut: boolean
  readonly stderrTail: string
  readonly args: string[]
  readonly durationMs: number
}

export class TailByteBuffer {
  constructor(maxBytes: number)
  push(chunk: Uint8Array): void
  toString(): string
}

export function runFfmpeg(args: string[], options?: RunFfmpegOptions): Promise<RunFfmpegResult>
