import { Readable } from 'node:stream'
import { describe, expect, it, jest } from '@jest/globals'
import { pacedChunks } from './paced-stream'
import { renditionSegments } from './playback-segment'
import { PlaybackPacingError } from './playback-session.service'

/** Two 10-second fragments of 1000 bytes each, right after a 100-byte init segment. */
const segments = renditionSegments(
  {
    bitrate: 128,
    codec: 'mp4a.40.2',
    size: 2100,
    initRange: [0, 99],
    fragments: [
      [0, 480_000, 100, 1000],
      [480_000, 480_000, 1100, 1000],
    ],
  },
  48_000,
)

const chunksOf = (...sizes: number[]): AsyncIterable<Buffer> =>
  Readable.from(sizes.map((size) => Buffer.alloc(size)))

const collect = async (iterable: AsyncIterable<Buffer>) => {
  const sizes: number[] = []
  for await (const chunk of iterable) sizes.push(chunk.length)
  return sizes
}

describe('pacedChunks', () => {
  it('passes every chunk through in order, charging each for the audio it carries', async () => {
    const charge = jest.fn(async (_audioMs: number) => undefined)

    const sizes = await collect(
      pacedChunks({ source: chunksOf(100, 500, 1500), startByte: 0, segments, charge }),
    )

    expect(sizes).toEqual([100, 500, 1500])
    expect(charge.mock.calls.map(([audioMs]) => audioMs)).toEqual([0, 5000, 15_000])
  })

  it('holds a chunk back until the budget allows it, then releases it', async () => {
    const charge = jest
      .fn(async (_audioMs: number) => undefined)
      .mockRejectedValueOnce(new PlaybackPacingError(3))
    const sleep = jest.fn(async (_ms: number) => undefined)

    const sizes = await collect(
      pacedChunks({ source: chunksOf(1000), startByte: 100, segments, charge, sleep }),
    )

    expect(sleep).toHaveBeenCalledWith(3000)
    expect(charge).toHaveBeenCalledTimes(2)
    expect(sizes).toEqual([1000])
  })

  it('counts audio from the byte the response starts at', async () => {
    const charge = jest.fn(async (_audioMs: number) => undefined)

    await collect(pacedChunks({ source: chunksOf(1000), startByte: 1100, segments, charge }))

    expect(charge).toHaveBeenCalledWith(10_000)
  })

  it('stops waiting once the listener has gone', async () => {
    const controller = new AbortController()
    const charge = jest.fn((_audioMs: number) => Promise.reject(new PlaybackPacingError(5)))
    const sleep = jest.fn((_ms: number) => {
      controller.abort()
      return Promise.resolve()
    })

    const sizes = await collect(
      pacedChunks({
        source: chunksOf(1000),
        startByte: 100,
        segments,
        charge,
        sleep,
        signal: controller.signal,
      }),
    )

    expect(sizes).toEqual([])
    expect(charge).toHaveBeenCalledTimes(1)
  })

  it('does not swallow a failure that is not a pacing refusal', async () => {
    const charge = jest.fn((_audioMs: number) => Promise.reject(new Error('redis exploded')))

    await expect(
      collect(pacedChunks({ source: chunksOf(1000), startByte: 100, segments, charge })),
    ).rejects.toThrow('redis exploded')
  })
})
