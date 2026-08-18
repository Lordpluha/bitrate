/**
 * Serialises every `SourceBuffer` operation. MSE rejects a second call while
 * `updating` is true, so appends and removes go through one chain rather than
 * racing each other.
 */

export type SourceBufferQueueInput = {
  sourceBuffer: SourceBuffer
  /** Seconds of already-played media kept behind the play head. */
  backBufferSeconds?: number
}

const DEFAULT_BACK_BUFFER_SECONDS = 30

/** Resolves once the buffer finishes its current operation. */
const settle = (sourceBuffer: SourceBuffer) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      sourceBuffer.removeEventListener('updateend', onDone)
      sourceBuffer.removeEventListener('error', onError)
      sourceBuffer.removeEventListener('abort', onDone)
    }

    const onDone = () => {
      cleanup()
      resolve()
    }

    const onError = () => {
      cleanup()
      reject(new Error('SourceBuffer signalled an error'))
    }

    sourceBuffer.addEventListener('updateend', onDone)
    sourceBuffer.addEventListener('error', onError)
    sourceBuffer.addEventListener('abort', onDone)
  })

const isQuotaError = (error: unknown) =>
  error instanceof DOMException && error.name === 'QuotaExceededError'

export class SourceBufferQueue {
  private readonly sourceBuffer: SourceBuffer
  private readonly backBufferSeconds: number
  private chain: Promise<void> = Promise.resolve()

  constructor({
    sourceBuffer,
    backBufferSeconds = DEFAULT_BACK_BUFFER_SECONDS,
  }: SourceBufferQueueInput) {
    this.sourceBuffer = sourceBuffer
    this.backBufferSeconds = backBufferSeconds
  }

  /** Queues an operation behind everything already scheduled. */
  private enqueue(operation: () => Promise<void>): Promise<void> {
    const next = this.chain.then(operation, operation)
    this.chain = next.catch(() => undefined)
    return next
  }

  /**
   * Appends bytes, trimming the back buffer and retrying once when the browser
   * reports the buffer is full. A quota error means "make room", not "give up".
   */
  append(bytes: ArrayBuffer, currentTime: number): Promise<void> {
    return this.enqueue(async () => {
      try {
        this.sourceBuffer.appendBuffer(bytes)
        await settle(this.sourceBuffer)
      } catch (error) {
        if (!isQuotaError(error)) throw error

        await this.trimUnsafe(currentTime)
        this.sourceBuffer.appendBuffer(bytes)
        await settle(this.sourceBuffer)
      }
    })
  }

  /** Drops media behind the play head to bound memory on long tracks. */
  trim(currentTime: number): Promise<void> {
    return this.enqueue(() => this.trimUnsafe(currentTime))
  }

  /** Trim without queueing — only safe from inside an already-queued operation. */
  private async trimUnsafe(currentTime: number): Promise<void> {
    const removeUntil = currentTime - this.backBufferSeconds
    if (removeUntil <= 0) return
    if (this.sourceBuffer.buffered.length === 0) return
    if (this.sourceBuffer.buffered.start(0) >= removeUntil) return

    this.sourceBuffer.remove(0, removeUntil)
    await settle(this.sourceBuffer)
  }

  /** Cancels the in-flight append so a seek can start immediately. */
  abort(): void {
    if (this.sourceBuffer.updating) {
      this.sourceBuffer.abort()
    }
  }

  /** Clears every buffered range, used when a seek lands outside the window. */
  clear(): Promise<void> {
    return this.enqueue(async () => {
      if (this.sourceBuffer.buffered.length === 0) return

      const end = this.sourceBuffer.buffered.end(
        this.sourceBuffer.buffered.length - 1,
      )
      this.sourceBuffer.remove(0, end)
      await settle(this.sourceBuffer)
    })
  }
}
