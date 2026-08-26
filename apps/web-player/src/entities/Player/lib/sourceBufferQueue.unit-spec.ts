import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SourceBufferQueue } from './sourceBufferQueue'

type Operation = { type: 'append' | 'remove'; args: unknown[] }

/**
 * Minimal SourceBuffer stand-in. Operations settle asynchronously through
 * `updateend`, exactly like the real one, so the queue's serialisation is exercised.
 */
class FakeSourceBuffer extends EventTarget {
  updating = false
  operations: Operation[] = []
  buffered: TimeRanges
  /** Throw QuotaExceededError on the next N appends. */
  quotaFailures = 0
  aborted = 0

  constructor(windows: [number, number][] = []) {
    super()
    const getWindow = (index: number) => {
      const window = windows[index]
      if (!window) throw new RangeError(`Missing buffered range ${index}`)
      return window
    }
    this.buffered = {
      length: windows.length,
      start: (index: number) => getWindow(index)[0],
      end: (index: number) => getWindow(index)[1],
    } as TimeRanges
  }

  private finish() {
    this.updating = false
    queueMicrotask(() => this.dispatchEvent(new Event('updateend')))
  }

  appendBuffer(bytes: ArrayBuffer) {
    if (this.quotaFailures > 0) {
      this.quotaFailures -= 1
      throw new DOMException('full', 'QuotaExceededError')
    }
    this.operations.push({ type: 'append', args: [bytes.byteLength] })
    this.updating = true
    this.finish()
  }

  remove(start: number, end: number) {
    this.operations.push({ type: 'remove', args: [start, end] })
    this.updating = true
    this.finish()
  }

  abort() {
    this.aborted += 1
    this.updating = false
  }

  failNext() {
    queueMicrotask(() => this.dispatchEvent(new Event('error')))
  }
}

const asSourceBuffer = (fake: FakeSourceBuffer) =>
  fake as unknown as SourceBuffer

describe('SourceBufferQueue', () => {
  let fake: FakeSourceBuffer

  beforeEach(() => {
    fake = new FakeSourceBuffer()
  })

  it('appends bytes', async () => {
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await queue.append(new ArrayBuffer(64), 0)

    expect(fake.operations).toEqual([{ type: 'append', args: [64] }])
  })

  it('serialises appends instead of overlapping them', async () => {
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await Promise.all([
      queue.append(new ArrayBuffer(1), 0),
      queue.append(new ArrayBuffer(2), 0),
      queue.append(new ArrayBuffer(3), 0),
    ])

    expect(fake.operations.map((operation) => operation.args[0])).toEqual([
      1, 2, 3,
    ])
  })

  it('trims the back buffer and retries when the browser reports a full buffer', async () => {
    fake = new FakeSourceBuffer([[0, 120]])
    fake.quotaFailures = 1
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await queue.append(new ArrayBuffer(64), 100)

    expect(fake.operations).toEqual([
      { type: 'remove', args: [0, 70] },
      { type: 'append', args: [64] },
    ])
  })

  it('gives up when the buffer is still full after making room', async () => {
    fake = new FakeSourceBuffer([[0, 120]])
    fake.quotaFailures = 2
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await expect(queue.append(new ArrayBuffer(64), 100)).rejects.toThrow(/full/)
  })

  it('keeps the configured window behind the play head', async () => {
    fake = new FakeSourceBuffer([[0, 120]])
    const queue = new SourceBufferQueue({
      sourceBuffer: asSourceBuffer(fake),
      backBufferSeconds: 10,
    })

    await queue.trim(100)

    expect(fake.operations).toEqual([{ type: 'remove', args: [0, 90] }])
  })

  it('does not trim before the play head has advanced past the window', async () => {
    fake = new FakeSourceBuffer([[0, 120]])
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await queue.trim(20)

    expect(fake.operations).toEqual([])
  })

  it('does not trim a range that was already dropped', async () => {
    fake = new FakeSourceBuffer([[100, 200]])
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await queue.trim(120)

    expect(fake.operations).toEqual([])
  })

  it('clears everything buffered', async () => {
    fake = new FakeSourceBuffer([
      [0, 30],
      [40, 90],
    ])
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    await queue.clear()

    expect(fake.operations).toEqual([{ type: 'remove', args: [0, 90] }])
  })

  it('aborts only while an operation is in flight', () => {
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })

    queue.abort()
    expect(fake.aborted).toBe(0)

    fake.updating = true
    queue.abort()
    expect(fake.aborted).toBe(1)
  })

  it('keeps accepting work after a failed operation', async () => {
    const queue = new SourceBufferQueue({ sourceBuffer: asSourceBuffer(fake) })
    fake.quotaFailures = 2

    await expect(queue.append(new ArrayBuffer(1), 0)).rejects.toThrow()
    await queue.append(new ArrayBuffer(2), 0)

    expect(fake.operations).toContainEqual({ type: 'append', args: [2] })
  })

  it('rejects when the SourceBuffer signals an error', async () => {
    const errorFake = new FakeSourceBuffer()
    errorFake.appendBuffer = vi.fn(() => {
      errorFake.failNext()
    })
    const queue = new SourceBufferQueue({
      sourceBuffer: asSourceBuffer(errorFake),
    })

    await expect(queue.append(new ArrayBuffer(1), 0)).rejects.toThrow(
      /signalled an error/,
    )
  })
})
