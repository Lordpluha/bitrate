import type { LandingCopy } from '../../model/copy'

/** Mutable state the engine modules share while the landing is mounted. */
type EngineState = {
  /** Index of the scene on screen. */
  index: number
  /** A scene change is running; input is ignored until it settles. */
  animating: boolean
  /** A physics ball is held; scene gestures are ignored. */
  dragging: boolean
  /** The logo intro covers the page (frames run slow while it loads). */
  intro: boolean
}

/** The latest pointer position, shared through one window listener instead of one per module. */
export type PointerStore = {
  /** Pointer position as a share of the viewport, -0.5…0.5 from its centre. */
  nx: number
  ny: number
  /** Runs `fn` on every pointer move until unmount. */
  listen: (fn: (e: PointerEvent) => void) => void
}

/** Everything an engine module needs: the landing root, its cleanup and shared state. */
export type EngineContext = {
  root: HTMLElement
  scenes: HTMLElement[]
  copy: LandingCopy
  reduce: boolean
  state: EngineState
  pointer: PointerStore
  /** Aborted on unmount; pass it to every addEventListener. */
  signal: AbortSignal
  /** Registers a teardown step that runs on unmount. */
  onDispose: (fn: () => void) => void
}

/** One passive window `pointermove` listener feeding every engine module. */
export const createPointerStore = ({
  signal,
}: {
  signal: AbortSignal
}): PointerStore => {
  const subscribers: ((e: PointerEvent) => void)[] = []
  const store: PointerStore = {
    nx: 0,
    ny: 0,
    listen: (fn) => {
      subscribers.push(fn)
    },
  }
  window.addEventListener(
    'pointermove',
    (e) => {
      store.nx = e.clientX / window.innerWidth - 0.5
      store.ny = e.clientY / window.innerHeight - 0.5
      for (const fn of subscribers) fn(e)
    },
    { passive: true, signal },
  )
  return store
}

/** The archived composition every scene board is laid out on. */
export const BOARD = { width: 1440, height: 900 } as const
/** Below this width scenes become a single column and the 3D stage steps back. */
const MOBILE_MAX_WIDTH = 820

export const isMobile = () => window.innerWidth <= MOBILE_MAX_WIDTH

/** Typed lookup inside the landing root; missing nodes are a markup bug, so they throw. */
export const must = <T extends Element>({
  root,
  selector,
  type,
}: {
  root: ParentNode
  selector: string
  type: new () => T
}): T => {
  const el = root.querySelector(selector)
  if (!(el instanceof type))
    throw new Error(`Landing markup is missing ${selector}`)
  return el
}

export const all = <T extends Element>({
  root,
  selector,
  type,
}: {
  root: ParentNode
  selector: string
  type: new () => T
}): T[] =>
  [...root.querySelectorAll(selector)].filter(
    (el): el is T => el instanceof type,
  )

/** Deterministic pseudo-random 0–1 from an index and a seed (layouts stay identical between visits). */
export const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453
  return x - Math.floor(x)
}
