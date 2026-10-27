import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlayerSlot } from '@/entities/Player/model/audioPlayer/audioPlayer.types'

/**
 * Characterises the legacy fallback chain for tracks without a CMAF manifest —
 * hls.js, then native HLS, then the progressive file — so replacing it with a
 * host-supplied adapter keeps the same order and recovery budget.
 */
const hlsState = vi.hoisted(() => ({
  instances: [] as FakeHlsInstance[],
  supported: true,
}))

type Listener = (event: string, data?: unknown) => void

type FakeHlsInstance = {
  config: Record<string, unknown>
  attachMedia: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
  loadSource: ReturnType<typeof vi.fn>
  recoverMediaError: ReturnType<typeof vi.fn>
  startLoad: ReturnType<typeof vi.fn>
  emit: (event: string, data?: unknown) => void
  levels: unknown[]
}

vi.mock('hls.js', () => {
  class FakeHls {
    static Events = {
      ERROR: 'error',
      MANIFEST_PARSED: 'manifestParsed',
      MEDIA_ATTACHED: 'mediaAttached',
    }
    static ErrorDetails = {
      FRAG_LOAD_ERROR: 'fragLoadError',
      FRAG_LOAD_TIMEOUT: 'fragLoadTimeOut',
      MANIFEST_LOAD_ERROR: 'manifestLoadError',
      MANIFEST_LOAD_TIMEOUT: 'manifestLoadTimeOut',
      MANIFEST_PARSING_ERROR: 'manifestParsingError',
    }
    static ErrorTypes = {
      MEDIA_ERROR: 'mediaError',
      NETWORK_ERROR: 'networkError',
    }
    static isSupported = () => hlsState.supported

    private readonly listeners = new Map<string, Listener[]>()
    levels: unknown[] = []
    attachMedia = vi.fn()
    destroy = vi.fn()
    loadSource = vi.fn()
    recoverMediaError = vi.fn()
    startLoad = vi.fn()

    constructor(readonly config: Record<string, unknown>) {
      hlsState.instances.push(this as unknown as FakeHlsInstance)
    }

    on(event: string, listener: Listener) {
      this.listeners.set(event, [
        ...(this.listeners.get(event) ?? []),
        listener,
      ])
    }

    emit(event: string, data?: unknown) {
      for (const listener of this.listeners.get(event) ?? [])
        listener(event, data)
    }
  }
  return { default: FakeHls }
})

const { attachHlsSource } = await import('./attachHlsSource')

const newSlot = (): PlayerSlot => ({
  currentBitrate: null,
  element: null,
  hls: null,
  loader: null,
  playbackKey: 'key-1',
  trackId: 't1',
})

const attach = (
  overrides: { isPrefetch?: boolean; canPlayHls?: boolean } = {},
) => {
  const element = document.createElement('audio')
  vi.spyOn(element, 'load').mockImplementation(() => undefined)
  vi.spyOn(element, 'canPlayType').mockReturnValue(
    overrides.canPlayHls ? 'maybe' : '',
  )
  const slot = newSlot()
  const onFatalError = vi.fn()
  attachHlsSource({
    element,
    isPrefetch: overrides.isPrefetch ?? false,
    onFatalError,
    playbackKey: 'key-1',
    progressiveUrl: 'https://cdn.test/t1.mp3',
    recoveryAttempts: {},
    slot,
    trackId: 't1',
  })
  return { element, onFatalError, slot }
}

const fatal = (type: string, details = 'other') => ({
  details,
  fatal: true,
  type,
})

describe('attachHlsSource', () => {
  beforeEach(() => {
    hlsState.instances = []
    hlsState.supported = true
  })

  it('loads the track through hls.js once the media is attached', () => {
    const { element, slot } = attach()
    const hls = hlsState.instances[0]

    expect(slot.hls).toBe(hls)
    expect(hls?.attachMedia).toHaveBeenCalledWith(element)
    hls?.emit('mediaAttached')
    expect(hls?.loadSource).toHaveBeenCalledWith(expect.stringContaining('t1'))
  })

  it('falls back to the progressive file on a fatal manifest or fragment load error', () => {
    const { element, slot } = attach()
    const hls = hlsState.instances[0]

    hls?.emit('error', fatal('networkError', 'manifestLoadError'))

    expect(hls?.destroy).toHaveBeenCalled()
    expect(slot.hls).toBeNull()
    expect(element.src).toBe('https://cdn.test/t1.mp3')
  })

  it('retries other fatal network errors three times before falling back', () => {
    const { element } = attach()
    const hls = hlsState.instances[0]

    for (let attempt = 0; attempt < 3; attempt += 1) {
      hls?.emit('error', fatal('networkError'))
    }
    expect(hls?.startLoad).toHaveBeenCalledTimes(3)
    expect(element.getAttribute('src')).toBeNull()

    hls?.emit('error', fatal('networkError'))
    expect(element.src).toBe('https://cdn.test/t1.mp3')
  })

  it('recovers fatal media errors through hls.js before falling back', () => {
    attach()
    const hls = hlsState.instances[0]

    hls?.emit('error', fatal('mediaError'))

    expect(hls?.recoverMediaError).toHaveBeenCalledTimes(1)
  })

  it('ignores non-fatal errors', () => {
    const { element } = attach()

    hlsState.instances[0]?.emit('error', {
      details: 'x',
      fatal: false,
      type: 'networkError',
    })

    expect(element.getAttribute('src')).toBeNull()
  })

  it('plays native HLS when hls.js is unsupported but the browser can', () => {
    hlsState.supported = false
    const { element } = attach({ canPlayHls: true })

    expect(hlsState.instances).toHaveLength(0)
    expect(element.src).toContain('t1')
    expect(element.src).not.toBe('https://cdn.test/t1.mp3')
  })

  it('goes straight to the progressive file when neither HLS path exists', () => {
    hlsState.supported = false
    const { element } = attach()

    expect(element.src).toBe('https://cdn.test/t1.mp3')
  })

  it('reports a fatal error when the progressive file fails too', () => {
    hlsState.supported = false
    const { element, onFatalError } = attach()

    element.dispatchEvent(new Event('error'))

    expect(onFatalError).toHaveBeenCalledTimes(1)
  })
})
