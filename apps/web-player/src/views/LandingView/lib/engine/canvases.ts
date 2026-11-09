import { all, type EngineContext } from './context'
import { tokenAlpha, tokenSolid } from './palette'

type Spec = {
  c: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  n: number
  tall: boolean
  scene: Element | null
}

/** Canvas backing store relative to its CSS size (crisp without a full devicePixelRatio cost). */
const RES = 1.5

/** Spectrum bars drawn into the small canvases inside scenes, and the rules scene's bands. */
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
    tall: tokenSolid('purple-400'),
    bar: tokenAlpha({ name: 'purple-400', alpha: 0.9 }),
    beat: tokenAlpha({ name: 'magenta-500', alpha: 0.95 }),
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
      /* tall spectra share one colour and vary only the alpha per bar */
      if (s.tall) s.ctx.fillStyle = ink.tall
      for (let i = 0; i < s.n; i++) {
        const v =
          (Math.sin(t * 2.1 + i * 0.5) * 0.5 + 0.5) *
          (Math.sin(t * 1.3 + i * 0.19) * 0.35 + 0.65) *
          0.7
        const bh = Math.max(2, v * h * (s.tall ? 0.9 : 0.85))
        if (s.tall) s.ctx.globalAlpha = 0.15 + v * 0.45
        else s.ctx.fillStyle = i % 6 === 0 ? ink.beat : ink.bar
        s.ctx.fillRect(
          i * bw + bw * 0.18,
          (h - bh) * (s.tall ? 1 : 0.5),
          bw * 0.64,
          bh,
        )
      }
      s.ctx.globalAlpha = 1
    }
  }

  /* audio bands for "your rules" */
  const bands = root.querySelector('#bands')
  if (bands && !bands.childElementCount)
    for (let i = 0; i < 18; i++) bands.appendChild(document.createElement('i'))

  return { drawSpecs }
}
