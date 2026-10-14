import { gsap } from 'gsap'
import type { LandingCopy } from '../../model/copy'
import { createCanvases } from './canvases'
import { all, BOARD, type EngineContext } from './context'
import { mountCursor } from './cursor'
import { mountParticles2d, mountPartners2d } from './fallback2d'
import { mountHeadings } from './headings'
import { playIntro } from './intro'
import { mountPointer } from './pointer'
import { mountScenes } from './scenes'
import { createStage, hasWebGL, type Stage } from './stage'
import { mountTeam } from './team'

/** Locks page scroll while the fullscreen scenes are on screen (not in the static, reduced-motion page). */
const LOCK_CLASS = 'landing-lock'

/**
 * Starts the landing's motion on an already rendered (server-side) landing root.
 * Returns a teardown that removes every listener, ticker, timer, tween and the WebGL context.
 */
export const mountLanding = ({
  root,
  copy,
}: {
  root: HTMLElement
  copy: LandingCopy
}) => {
  const controller = new AbortController()
  const disposers: (() => void)[] = []
  const ctx: EngineContext = {
    root,
    scenes: all({ root, selector: '.scene', type: HTMLElement }),
    copy,
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    state: { index: 0, animating: false, dragging: false },
    signal: controller.signal,
    onDispose: (fn) => {
      disposers.push(fn)
    },
  }
  const html = document.documentElement
  if (!ctx.reduce) {
    html.classList.add(LOCK_CLASS)
    ctx.onDispose(() => html.classList.remove(LOCK_CLASS))
  }

  /* board scale: the 1440x900 composition fitted to any viewport */
  const fitBoard = () =>
    root.style.setProperty(
      '--s',
      String(
        Math.min(
          window.innerWidth / BOARD.width,
          window.innerHeight / BOARD.height,
        ),
      ),
    )
  fitBoard()
  window.addEventListener('resize', fitBoard, { signal: ctx.signal })

  const headings = mountHeadings(ctx)
  const canvases = createCanvases(ctx)
  mountPointer(ctx)
  mountCursor(ctx)
  const resetTeam = mountTeam(ctx)
  const canvas = root.querySelector<HTMLCanvasElement>('#stage')
  const webgl = Boolean(canvas) && hasWebGL()
  const resetPartners = webgl ? null : mountPartners2d(ctx)
  if (canvas && !webgl) mountParticles2d({ ctx, canvas })

  let stage: Stage | null = null
  const scenes = mountScenes(ctx, {
    get stage() {
      return stage
    },
    drawWaves: canvases.drawWaves,
    glitch: headings.glitch,
    resetTeam,
    resetPartners,
  })

  /* the app theme lives as a class on <html>: repaint highlights and the stage when it changes */
  const themeWatch = new MutationObserver(() => {
    headings.paint()
    stage?.retheme()
  })
  themeWatch.observe(html, { attributes: true, attributeFilter: ['class'] })
  ctx.onDispose(() => themeWatch.disconnect())

  const tick = (t: number) => canvases.drawSpecs(t)
  if (ctx.reduce) canvases.drawSpecs(0)
  else {
    gsap.ticker.add(tick)
    ctx.onDispose(() => gsap.ticker.remove(tick))
  }

  const intro = playIntro(ctx)
  scenes.start(intro)

  if (canvas && webgl) {
    void createStage({ ctx, canvas })
      .then((s) => {
        if (controller.signal.aborted) {
          s.dispose()
          return
        }
        stage = s
        ctx.onDispose(() => s.dispose())
        if (ctx.reduce) {
          s.go(0, 0.01)
          gsap.delayedCall(0.1, s.still)
          return
        }
        s.start()
        /* the stage arrives after first paint: move it straight to the scene already on screen */
        void intro.then(() => s.go(ctx.state.index, 1.8))
      })
      .catch(() => {
        /* WebGL failed late (context lost, driver): fall back to the 2D field */
        if (controller.signal.aborted) return
        mountParticles2d({ ctx, canvas })
      })
  }

  return () => {
    controller.abort()
    for (const fn of disposers.reverse()) fn()
    gsap.killTweensOf(root.querySelectorAll('*'))
  }
}
