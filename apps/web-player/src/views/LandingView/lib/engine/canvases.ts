import { all, type EngineContext } from './context'
import { tokenAlpha } from './palette'

type Spec = {
  c: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  n: number
  tall: boolean
  scene: Element | null
}

/** Canvas backing store relative to its CSS size (crisp without a full devicePixelRatio cost). */
const RES = 1.5

/** Spectrum bars and waveforms drawn into the small canvases inside scenes. */
export const createCanvases = ({ root }: EngineContext) => {
  const specs: Spec[] = all({
    root,
    selector: 'canvas.spec',
    type: HTMLCanvasElement,
  }).flatMap((c) => {
    const ctx = c.getContext('2d')
    return ctx
      ? [
          {
            c,
            ctx,
            n: Number(c.dataset.bars) || 32,
            tall: Boolean(c.dataset.tall),
            scene: c.closest('.scene'),
          },
        ]
      : []
  })
  const ink = {
    tall: (a: number) => tokenAlpha({ name: 'purple-400', alpha: a }),
    bar: tokenAlpha({ name: 'purple-400', alpha: 0.9 }),
    beat: tokenAlpha({ name: 'magenta-500', alpha: 0.95 }),
    played: tokenAlpha({ name: 'purple-400', alpha: 1 }),
    rest: tokenAlpha({ name: 'neutral-400', alpha: 0.45 }),
  }

  /** Redraws the spectra of the scene on screen. */
  const drawSpecs = (t: number) => {
    for (const s of specs) {
      if (!s.scene?.classList.contains('is-active')) continue
      const w = Math.round(s.c.clientWidth * RES)
      const h = Math.round(s.c.clientHeight * RES)
      if (!w || !h) continue
      if (s.c.width !== w) {
        s.c.width = w
        s.c.height = h
      }
      s.ctx.clearRect(0, 0, w, h)
      const bw = w / s.n
      for (let i = 0; i < s.n; i++) {
        const v =
          (Math.sin(t * 2.1 + i * 0.5) * 0.5 + 0.5) *
          (Math.sin(t * 1.3 + i * 0.19) * 0.35 + 0.65) *
          0.7
        const bh = Math.max(2, v * h * (s.tall ? 0.9 : 0.85))
        s.ctx.fillStyle = s.tall
          ? ink.tall(0.15 + v * 0.45)
          : i % 6 === 0
            ? ink.beat
            : ink.bar
        s.ctx.fillRect(
          i * bw + bw * 0.18,
          (h - bh) * (s.tall ? 1 : 0.5),
          bw * 0.64,
          bh,
        )
      }
    }
  }

  /** Static waveforms (timed comments); drawn when their scene becomes visible. */
  const drawWaves = () => {
    for (const c of all({
      root,
      selector: 'canvas.wave',
      type: HTMLCanvasElement,
    })) {
      const w = Math.round(c.clientWidth * RES)
      const h = Math.round(c.clientHeight * RES)
      const ctx = c.getContext('2d')
      if (!w || !ctx) continue
      c.width = w
      c.height = h
      const seed = Number(c.dataset.seed) || 1
      const n = Math.floor(w / 6)
      for (let i = 0; i < n; i++) {
        const v = Math.abs(
          Math.sin(i * 0.21 * seed + seed) * 0.6 +
            Math.sin(i * 0.05 + seed * 2) * 0.4,
        )
        const bh = Math.max(2, v * h * 0.9)
        ctx.fillStyle = i / n < 0.42 ? ink.played : ink.rest
        ctx.fillRect(i * 6, (h - bh) / 2, 3, bh)
      }
    }
  }

  /* audio bands for "your rules" */
  const bands = root.querySelector('#bands')
  if (bands && !bands.childElementCount)
    for (let i = 0; i < 18; i++) bands.appendChild(document.createElement('i'))

  return { drawSpecs, drawWaves }
}
