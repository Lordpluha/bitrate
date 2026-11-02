/**
 * Interface sounds, synthesised with the Web Audio API: no audio files to download and no
 * dependency. Hovering and pressing are dry, pitchless ticks; opening a menu is a short sine
 * sweep through a soft echo, which gives the workspace its quiet "space" character.
 */

type InterfaceCue = 'hover' | 'press' | 'open'

interface Tone {
  type: OscillatorType
  /** Start and end pitch in Hz; the sweep is exponential. */
  from: number
  to: number
  /** Seconds after the cue starts. */
  at: number
  duration: number
  gain: number
}

/** A burst of band-passed noise: `frequency` sets how bright it is, `duration` how long. */
interface Tick {
  duration: number
  frequency: number
  q: number
  gain: number
}

/**
 * Ticks have no pitch and no echo, so sweeping across a list taps softly instead of ringing
 * like bells. A press is lower, longer and louder than a hover, so it feels firmer.
 */
const TICKS: Record<'hover' | 'press', Tick> = {
  hover: { duration: 0.018, frequency: 1800, q: 0.9, gain: 0.06 },
  press: { duration: 0.03, frequency: 1100, q: 1.2, gain: 0.16 },
}

const LONGEST_TICK = Math.max(
  ...Object.values(TICKS).map((tick) => tick.duration),
)

const CUES: Record<'open', readonly Tone[]> = {
  open: [
    { type: 'sine', from: 420, to: 840, at: 0, duration: 0.16, gain: 0.05 },
    {
      type: 'sine',
      from: 840,
      to: 1260,
      at: 0.04,
      duration: 0.12,
      gain: 0.025,
    },
  ],
}

/** Controls that make a sound; disabled ones stay silent. */
const INTERACTIVE = [
  'button:not(:disabled)',
  'a[href]',
  'summary',
  'select:not(:disabled)',
  'label:has(> input:not(:disabled))',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemradio"]',
  '[role="menuitemcheckbox"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
].join(', ')

/** Sweeping the pointer across a list should tick now and then, not rattle. */
const HOVER_GAP_MS = 80

interface Output {
  context: AudioContext
  /** Into the echo and the speakers: for tones. */
  input: AudioNode
  /** Straight to the speakers: for ticks. */
  dry: AudioNode
  noise: AudioBuffer
}

let output: Output | null = null

/** Browsers only start audio after a gesture, so the graph is built on the first one. */
function connect(): Output | null {
  if (output) return output
  if (typeof AudioContext === 'undefined') return null
  const context = new AudioContext()
  const master = context.createGain()
  master.gain.value = 0.6
  master.connect(context.destination)
  // A short, darkened echo: the dry tone plus two or three fading repeats.
  const delay = context.createDelay(0.5)
  delay.delayTime.value = 0.11
  const feedback = context.createGain()
  feedback.gain.value = 0.28
  const tone = context.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2400
  const wet = context.createGain()
  wet.gain.value = 0.35
  delay.connect(tone).connect(feedback).connect(delay)
  tone.connect(wet).connect(master)
  const input = context.createGain()
  input.connect(master)
  input.connect(delay)
  const noise = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * LONGEST_TICK),
    context.sampleRate,
  )
  const samples = noise.getChannelData(0)
  for (let index = 0; index < samples.length; index++)
    samples[index] = Math.random() * 2 - 1
  output = { context, input, dry: master, noise }
  return output
}

function play(cue: InterfaceCue) {
  if (!output) return
  const { context } = output
  // The first gesture's resume is still settling; play once it has.
  if (context.state === 'suspended') {
    void context.resume().then(() => sound(cue))
    return
  }
  if (context.state === 'running') sound(cue)
}

function tick({ context, dry, noise }: Output, shape: Tick) {
  const at = context.currentTime
  const source = context.createBufferSource()
  source.buffer = noise
  const band = context.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = shape.frequency
  band.Q.value = shape.q
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(shape.gain, at)
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + shape.duration)
  source.connect(band).connect(envelope).connect(dry)
  source.start(at)
  source.stop(at + shape.duration)
}

function sound(cue: InterfaceCue) {
  if (!output) return
  if (cue !== 'open') {
    tick(output, TICKS[cue])
    return
  }
  const { context, input } = output
  const start = context.currentTime
  for (const tone of CUES[cue]) {
    const at = start + tone.at
    const oscillator = context.createOscillator()
    oscillator.type = tone.type
    oscillator.frequency.setValueAtTime(tone.from, at)
    oscillator.frequency.exponentialRampToValueAtTime(
      tone.to,
      at + tone.duration,
    )
    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0.0001, at)
    envelope.gain.exponentialRampToValueAtTime(tone.gain, at + 0.006)
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + tone.duration)
    oscillator.connect(envelope).connect(input)
    oscillator.start(at)
    oscillator.stop(at + tone.duration + 0.02)
  }
}

function interactiveTarget(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null
  const control = target.closest(INTERACTIVE)
  return control?.getAttribute('aria-disabled') === 'true' ? null : control
}

/** Opening a menu, popover or disclosure sounds different from an ordinary press. */
function opens(control: Element) {
  const popup = control.getAttribute('aria-haspopup')
  return (
    (popup !== null && popup !== 'false') ||
    control.getAttribute('aria-expanded') === 'false'
  )
}

/**
 * Plays interface sounds for the whole document through three delegated listeners, so no
 * component needs to know about them. Returns the cleanup.
 */
export function listenForInterfaceSounds(): () => void {
  let lastHover = 0

  const unlock = () => {
    const ready = connect()
    if (ready && ready.context.state === 'suspended')
      void ready.context.resume()
  }

  const hover = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const control = interactiveTarget(event.target)
    if (!control) return
    // Moving between a control's own children is not a new hover.
    if (
      event.relatedTarget instanceof Node &&
      control.contains(event.relatedTarget)
    )
      return
    const now = performance.now()
    if (now - lastHover < HOVER_GAP_MS) return
    lastHover = now
    play('hover')
  }

  const press = (event: MouseEvent) => {
    const control = interactiveTarget(event.target)
    if (!control) return
    unlock()
    play(opens(control) ? 'open' : 'press')
  }

  document.addEventListener('pointerdown', unlock, { capture: true })
  document.addEventListener('keydown', unlock, { capture: true })
  document.addEventListener('pointerover', hover)
  // Capture, so the cue reads `aria-expanded` before the control toggles it.
  document.addEventListener('click', press, { capture: true })
  return () => {
    document.removeEventListener('pointerdown', unlock, { capture: true })
    document.removeEventListener('keydown', unlock, { capture: true })
    document.removeEventListener('pointerover', hover)
    document.removeEventListener('click', press, { capture: true })
  }
}
