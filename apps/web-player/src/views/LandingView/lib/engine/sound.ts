import type { EngineContext } from './context'

/** Pad chord (A minor add9-ish) in Hz; odd voices are sawtooth, even triangle. */
const CHORD = [110, 164.81, 220, 277.18, 329.63]
const KICK_EVERY_MS = 545
const MASTER_ON = 0.5
const FADE_S = 0.6
/** Bins averaged into the level the stage, spectra and cursor react to. */
const LEVEL_BINS = 24

type Synth = {
  ctx: AudioContext
  master: GainNode
  analyser: AnalyserNode
  bins: Uint8Array<ArrayBuffer>
  kick: number
}

const createSynth = (): Synth => {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  const bins = new Uint8Array(analyser.frequencyBinCount)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.9
  lfoGain.gain.value = 600
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()
  CHORD.forEach((f, i) => {
    const o = ctx.createOscillator()
    o.type = i % 2 ? 'sawtooth' : 'triangle'
    o.frequency.value = f
    o.detune.value = (i - 2) * 6
    const g = ctx.createGain()
    g.gain.value = 0.08
    o.connect(g).connect(filter)
    o.start()
  })
  const hit = () => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.setValueAtTime(120, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25)
    g.gain.setValueAtTime(0.5, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    o.connect(g).connect(master)
    o.start()
    o.stop(ctx.currentTime + 0.3)
  }
  const kick = window.setInterval(() => {
    if (ctx.state === 'running' && master.gain.value > 0.01) hit()
  }, KICK_EVERY_MS)
  filter.connect(master)
  master.connect(analyser)
  analyser.connect(ctx.destination)
  return { ctx, master, analyser, bins, kick }
}

/**
 * The header's "Play signal" toggle: a soft synth pad (demo, no track) that starts only on click and
 * drives the stage through an AnalyserNode. Returns a per-frame level reader.
 */
export const mountSound = (ctx: EngineContext) => {
  const button = ctx.root.querySelector<HTMLButtonElement>(
    '[data-landing-sound]',
  )
  const label = button?.querySelector('.label')
  let synth: Synth | null = null
  let on = false
  button?.addEventListener(
    'click',
    async () => {
      try {
        synth ??= createSynth()
        on = !on
        if (on) await synth.ctx.resume()
        synth.master.gain.cancelScheduledValues(synth.ctx.currentTime)
        synth.master.gain.linearRampToValueAtTime(
          on ? MASTER_ON : 0,
          synth.ctx.currentTime + FADE_S,
        )
        button.setAttribute('aria-pressed', String(on))
        button.classList.toggle('playing', on)
        if (label)
          label.textContent = ctx.copy(
            on ? 'chrome.pause_signal' : 'chrome.play_signal',
          )
      } catch {
        on = false
        if (label) label.textContent = ctx.copy('chrome.sound_unavailable')
      }
    },
    { signal: ctx.signal },
  )
  ctx.onDispose(() => {
    if (!synth) return
    window.clearInterval(synth.kick)
    void synth.ctx.close()
  })
  /** Current output level 0–1; zero while the toggle is off. */
  return () => {
    if (!synth || !on) return 0
    synth.analyser.getByteFrequencyData(synth.bins)
    let v = 0
    for (let i = 0; i < LEVEL_BINS; i++) v += synth.bins[i] ?? 0
    return v / (LEVEL_BINS * 255)
  }
}
