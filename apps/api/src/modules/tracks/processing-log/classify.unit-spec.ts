import { describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { classifyProcessingError, errorMessageOf, errorNameOf } from './classify'

/** Builds an object shaped like `@bitrate/converter`'s `FfmpegError`, without importing it. */
type FfmpegErrorOverrides = {
  message?: string
  exitCode: number | null
  signal: string | null
  timedOut: boolean
  stderrTail: string
  args: string[]
}

function buildFfmpegError({ message = 'ffmpeg failed', ...rest }: FfmpegErrorOverrides): Error {
  const error = new Error(message)
  error.name = 'FfmpegError'
  return Object.assign(error, rest)
}

describe('classifyProcessingError', () => {
  it('classifies a timed-out FFmpeg run as TIMEOUT, not retryable', () => {
    const error = buildFfmpegError({
      message: 'timed out',
      exitCode: null,
      signal: null,
      timedOut: true,
      stderrTail: 'stalled at frame=100',
      args: ['-i', 'in.wav'],
    })

    const result = classifyProcessingError(error)

    expect(result).toMatchObject({
      code: 'TIMEOUT',
      retryable: false,
      stderrTail: 'stalled at frame=100',
      commandSummary: '-i in.wav',
    })
  })

  it('classifies a signal-killed FFmpeg run as FFMPEG_SIGNAL, retryable', () => {
    const error = buildFfmpegError({
      message: 'killed',
      exitCode: null,
      signal: 'SIGKILL',
      timedOut: false,
      stderrTail: '',
      args: ['-i', 'in.wav'],
    })

    const result = classifyProcessingError(error)

    expect(result).toMatchObject({ code: 'FFMPEG_SIGNAL', retryable: true, signal: 'SIGKILL' })
  })

  it('classifies a non-zero FFmpeg exit as FFMPEG_EXIT, not retryable', () => {
    const error = buildFfmpegError({
      message: 'exited',
      exitCode: 1,
      signal: null,
      timedOut: false,
      stderrTail: 'Invalid data found',
      args: ['-i', 'in.wav'],
    })

    const result = classifyProcessingError(error)

    expect(result).toMatchObject({ code: 'FFMPEG_EXIT', retryable: false, exitCode: 1 })
  })

  it('classifies a BadRequestException as INVALID_INPUT, not retryable', () => {
    const result = classifyProcessingError(
      new BadRequestException('Invalid or unreadable audio file'),
    )

    expect(result).toMatchObject({ code: 'INVALID_INPUT', retryable: false })
  })

  it('classifies an invalid-bitrate message as INVALID_INPUT', () => {
    const result = classifyProcessingError(new Error('Invalid audio bitrate: 999k'))

    expect(result).toMatchObject({ code: 'INVALID_INPUT', retryable: false })
  })

  it('classifies an empty-output message as EMPTY_OUTPUT, not retryable', () => {
    const result = classifyProcessingError(new Error('Converted audio file is empty: /tmp/a.opus'))

    expect(result).toMatchObject({ code: 'EMPTY_OUTPUT', retryable: false })
  })

  it('classifies a missing HLS segment message as EMPTY_OUTPUT', () => {
    const result = classifyProcessingError(
      new Error('HLS playlist has no initialization segment: /tmp/hls/128'),
    )

    expect(result).toMatchObject({ code: 'EMPTY_OUTPUT', retryable: false })
  })

  it('classifies an ENOSPC error as STORAGE, retryable', () => {
    const result = classifyProcessingError(new Error('write failed, ENOSPC: no space left'))

    expect(result).toMatchObject({ code: 'STORAGE', retryable: true })
  })

  it('classifies an S3-named error as STORAGE, retryable', () => {
    const error = new Error('upload failed')
    error.name = 'S3ServiceException'

    const result = classifyProcessingError(error)

    expect(result).toMatchObject({ code: 'STORAGE', retryable: true })
  })

  it('classifies a Prisma known-request error as DATABASE, retryable', () => {
    const error = new Prisma.PrismaClientKnownRequestError('conflict', {
      code: 'P2002',
      clientVersion: 'test',
    })

    const result = classifyProcessingError(error)

    expect(result).toMatchObject({ code: 'DATABASE', retryable: true })
  })

  it('classifies an unrecognised error as UNKNOWN, retryable', () => {
    const result = classifyProcessingError(new Error('something else entirely'))

    expect(result).toMatchObject({ code: 'UNKNOWN', retryable: true })
  })

  it('classifies a non-Error thrown value as UNKNOWN', () => {
    const result = classifyProcessingError('a plain string')

    expect(result).toMatchObject({ code: 'UNKNOWN', retryable: true })
  })
})

describe('errorMessageOf', () => {
  it('extracts the message from an Error', () => {
    expect(errorMessageOf(new Error('boom'))).toBe('boom')
  })

  it('returns a string thrown value as-is', () => {
    expect(errorMessageOf('boom')).toBe('boom')
  })

  it('falls back to a generic message for anything else', () => {
    expect(errorMessageOf({ nope: true })).toBe('Unknown error')
  })
})

describe('errorNameOf', () => {
  it('extracts the constructor name from an Error', () => {
    expect(errorNameOf(new TypeError('boom'))).toBe('TypeError')
  })

  it('returns null for a non-Error thrown value', () => {
    expect(errorNameOf('boom')).toBeNull()
  })
})
