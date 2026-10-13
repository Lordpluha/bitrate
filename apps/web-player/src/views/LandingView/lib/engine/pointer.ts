import { gsap } from 'gsap'
import { all, type EngineContext, isMobile } from './context'

/** Cursor glow, magnetic buttons, hero window parallax and card tilt — transforms only. */
export const mountPointer = (ctx: EngineContext) => {
  const { root, signal, state } = ctx
  const glow = root.querySelector('.cursor-glow')
  if (glow) {
    const gx = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' })
    const gy = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' })
    window.addEventListener(
      'pointermove',
      (e) => {
        gx(e.clientX)
        gy(e.clientY)
      },
      { passive: true, signal },
    )
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
  window.addEventListener(
    'pointermove',
    (e) => {
      if (
        !heroWin ||
        ctx.scenes[state.index]?.id !== 'hero' ||
        state.animating ||
        isMobile()
      )
        return
      const mx = e.clientX / window.innerWidth - 0.5
      const my = e.clientY / window.innerHeight - 0.5
      gsap.to(heroWin, {
        rotateY: -14 + mx * 10,
        rotateX: 6 - my * 8,
        duration: 0.8,
        overwrite: 'auto',
      })
    },
    { passive: true, signal },
  )
  for (const el of all({ root, selector: '.tiltable', type: HTMLElement })) {
    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect()
        gsap.to(el, {
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * 10,
          rotateX: -((e.clientY - r.top) / r.height - 0.5) * 10,
          transformPerspective: 1000,
          duration: 0.4,
        })
      },
      { signal },
    )
    el.addEventListener(
      'pointerleave',
      () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6 }),
      { signal },
    )
  }
}
