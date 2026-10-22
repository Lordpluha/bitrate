import { gsap } from 'gsap'
import { all, type EngineContext, isMobile } from './context'

/** Cursor glow, magnetic buttons, hero window parallax and card tilt — transforms only. */
export const mountPointer = (ctx: EngineContext) => {
  const { root, signal, state, pointer } = ctx
  const glow = root.querySelector('.cursor-glow')
  if (glow) {
    const gx = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' })
    const gy = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' })
    pointer.listen((e) => {
      gx(e.clientX)
      gy(e.clientY)
    })
  }
  if (ctx.reduce || !matchMedia('(hover: hover)').matches) return
  for (const el of all({ root, selector: '.magnetic', type: HTMLElement })) {
    const xTo = gsap.quickTo(el, 'x', {
      duration: 0.5,
      ease: 'elastic.out(1, .4)',
    })
    const yTo = gsap.quickTo(el, 'y', {
      duration: 0.5,
      ease: 'elastic.out(1, .4)',
    })
    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.3)
        yTo((e.clientY - r.top - r.height / 2) * 0.4)
      },
      { signal },
    )
    el.addEventListener(
      'pointerleave',
      () => {
        xTo(0)
        yTo(0)
      },
      { signal },
    )
  }
  const heroWin = root.querySelector('#heroWin')
  /* overwrite takes the window over from the scene entrance's own tilt */
  pointer.listen(() => {
    if (
      !heroWin ||
      ctx.scenes[state.index]?.id !== 'hero' ||
      state.animating ||
      isMobile()
    )
      return
    gsap.to(heroWin, {
      rotateY: -14 + pointer.nx * 10,
      rotateX: 6 - pointer.ny * 8,
      duration: 0.8,
      overwrite: 'auto',
    })
  })
  for (const el of all({ root, selector: '.tiltable', type: HTMLElement })) {
    /* one retargeted tween per axis instead of a new tween per pointer event */
    const tilt = { duration: 0.4 }
    const yTo = gsap.quickTo(el, 'rotateY', tilt)
    const xTo = gsap.quickTo(el, 'rotateX', tilt)
    const perspectiveTo = gsap.quickTo(el, 'transformPerspective', tilt)
    let settle: gsap.core.Tween | null = null
    el.addEventListener(
      'pointermove',
      (e) => {
        settle?.kill()
        settle = null
        const r = el.getBoundingClientRect()
        yTo(((e.clientX - r.left) / r.width - 0.5) * 10)
        xTo(-((e.clientY - r.top) / r.height - 0.5) * 10)
        perspectiveTo(1000)
      },
      { signal },
    )
    el.addEventListener(
      'pointerleave',
      () => {
        settle = gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6 })
      },
      { signal },
    )
  }
}
