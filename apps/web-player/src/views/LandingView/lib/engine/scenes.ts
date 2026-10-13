import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { all, type EngineContext, isMobile } from './context'
import { formatSceneNumber, sceneFromHash, targetScene } from './navigation'
import type { Stage } from './stage'

/** Panels that scroll on their own and the physics fields keep their native gestures. */
export const OWN_GESTURES = '.ai-panel, .hpanel, .drag-zone, input, textarea'
const SHUFFLE_EVERY_MS = 2600
const GLITCH_EVERY_MS = 3200
/** Lock after a scene change so one trackpad swipe moves one scene. */
const SETTLE_S = 0.7

type SceneDeps = {
  stage: Stage | null
  drawWaves: () => void
  glitch: (el: Element) => void
  resetTeam: () => void
  resetPartners: (() => void) | null
}

/** Scene changes: enter/leave timelines, wheel/touch/key/dot/hash navigation, the counter and URL hash. */
export const mountScenes = (ctx: EngineContext, deps: SceneDeps) => {
  const { root, scenes, state, signal } = ctx
  const dots = all({
    root,
    selector: '[data-scene-dot]',
    type: HTMLButtonElement,
  })
  const num = root.querySelector('[data-scene-num]')
  const rail = root.querySelector('[data-scene-rail]')
  const sweep = root.querySelector('.sweep')
  const typed = root.querySelector('#typed')
  const prompt = typed?.textContent ?? ''
  const libQ = root.querySelector('#libQ')
  const query = libQ?.textContent ?? ''
  const tgQueue = root.querySelector('#tgQueue')
  const stack = root.querySelector('#stack')
  const loops: gsap.core.Animation[] = []
  const stopLoops = () => {
    while (loops.length) loops.pop()?.kill()
  }
  let shuffleTimer = 0
  ctx.onDispose(() => window.clearInterval(shuffleTimer))

  /* workshop candidates re-rank (FLIP, transforms only) */
  const shuffle = () => {
    window.clearInterval(shuffleTimer)
    if (!stack) return
    shuffleTimer = window.setInterval(() => {
      if (scenes[state.index]?.id !== 'workshop') {
        window.clearInterval(shuffleTimer)
        return
      }
      const items = [...stack.children].filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      )
      const firstItem = items[0]
      if (!firstItem) return
      const first = items.map((el) => el.getBoundingClientRect().top)
      stack.appendChild(firstItem)
      ;[...stack.children].forEach((el, k) => {
        const r = el.querySelector('.r')
        if (r) r.textContent = `#${k + 1}`
      })
      const last = items.map((el) => el.getBoundingClientRect().top)
      const scale = isMobile()
        ? 1
        : Number(getComputedStyle(root).getPropertyValue('--s')) || 1
      items.forEach((el, k) => {
        gsap.fromTo(
          el,
          { y: ((first[k] ?? 0) - (last[k] ?? 0)) / scale },
          { y: 0, duration: 0.8, ease: 'expo.inOut' },
        )
      })
    }, SHUFFLE_EVERY_MS)
  }

  const typeInto = ({
    tl,
    el,
    text,
    duration,
    at,
  }: {
    tl: gsap.core.Timeline
    el: Element | null
    text: string
    duration: number
    at: number
  }) => {
    if (!el) return
    el.textContent = ''
    const o = { n: 0 }
    tl.to(
      o,
      {
        n: text.length,
        duration,
        ease: 'none',
        onUpdate: () => {
          el.textContent = text.slice(0, Math.round(o.n))
        },
      },
      at,
    )
  }

  const enter = (s: HTMLElement, dir: number) => {
    const tl = gsap.timeline()
    const mob = isMobile()
    const q = (sel: string) => s.querySelectorAll(sel)
    tl.fromTo(
      q('.char'),
      { y: 0, yPercent: 115 * dir, rotate: 10 * dir, opacity: 0 },
      {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.012,
      },
      0.1,
    )
    tl.fromTo(
      q('[data-a="up"]'),
      { y: 26 * dir, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 },
      0.3,
    )
    tl.fromTo(
      q('[data-a="win"]'),
      {
        y: 90 * dir,
        opacity: 0,
        rotateX: mob ? 0 : 16 * dir,
        rotateY: mob ? 0 : -10,
        rotateZ: 0,
        scale: 0.94,
        transformPerspective: 1600,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.1,
      },
      0.2,
    )
    const id = s.id
    if (id === 'hero' && !mob) {
      tl.to(
        q('#heroWin'),
        {
          rotateY: -14,
          rotateX: 6,
          rotateZ: -1,
          duration: 1.4,
          ease: 'expo.out',
        },
        0.9,
      )
      loops.push(
        gsap.fromTo(
          q('#heroProg'),
          { scaleX: 0.3 },
          { scaleX: 0.62, duration: 9, ease: 'none', repeat: -1 },
        ),
      )
    }
    if (id === 'loop') {
      tl.fromTo(
        q('.anim-prog'),
        { scaleX: 0 },
        { scaleX: 0.42, duration: 1.6, ease: 'power2.out' },
        0.8,
      )
      tl.fromTo(
        q('.like-pop'),
        { scale: 0 },
        { scale: 1, duration: 0.5, ease: 'back.out(4)', stagger: 0.15 },
        1.1,
      )
    }
    if (id === 'workshop') {
      typeInto({ tl, el: typed, text: prompt, duration: 2, at: 0.8 })
      tl.fromTo(
        q('#wsFill'),
        { scaleX: 0 },
        { scaleX: 0.66, duration: 1.2, ease: 'power2.inOut' },
        0.8,
      )
      tl.fromTo(
        q('.cand'),
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
        1.2,
      )
      tl.call(shuffle, undefined, 2.6)
    }
    if (id === 'rules') {
      tgQueue?.classList.remove('on')
      tl.call(() => tgQueue?.classList.add('on'), undefined, 1.2)
      if (!mob) {
        loops.push(
          gsap.fromTo(
            q('#bands i'),
            { scaleY: 0.1 },
            {
              scaleY: () => 0.25 + Math.random() * 0.75,
              duration: 0.5,
              ease: 'sine.inOut',
              stagger: { each: 0.05, repeat: -1, yoyo: true },
            },
          ),
        )
        tl.fromTo(
          q('#floatQ'),
          { x: -230, y: 140, rotate: 0, opacity: 0 },
          {
            x: 0,
            y: 0,
            rotate: -5,
            opacity: 1,
            duration: 1.4,
            ease: 'expo.out',
          },
          1.3,
        )
        loops.push(
          gsap.to(q('#floatQ'), {
            y: -10,
            rotate: -3.5,
            duration: 2.4,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: 2.8,
          }),
        )
      }
    }
    if (id === 'library') {
      typeInto({ tl, el: libQ, text: query, duration: 0.8, at: 0.8 })
      tl.fromTo(
        q('.lres'),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 },
        1.3,
      )
      tl.fromTo(
        q('.vrow'),
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
        1,
      )
    }
    if (id === 'discover' && !mob) {
      for (const p of s.querySelectorAll<SVGPathElement>('.graph path')) {
        const L = p.getTotalLength()
        tl.fromTo(
          p,
          { strokeDasharray: `${L} ${L}`, strokeDashoffset: L },
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.set(p, { clearProps: 'strokeDasharray,strokeDashoffset' })
            },
          },
          0.7 + Math.random() * 0.4,
        )
      }
      tl.fromTo(
        q('.node'),
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          ease: 'back.out(2)',
          stagger: { each: 0.07, from: 'end' },
        },
        0.6,
      )
      tl.fromTo(
        q('.tag'),
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.06 },
        1.4,
      )
    }
    if (id === 'devices') {
      if (!mob) {
        tl.fromTo(
          q('#devLink'),
          { strokeDashoffset: 300 },
          { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' },
          1,
        )
        tl.fromTo(
          q('.phone'),
          { x: -120 },
          { x: 0, duration: 1.3, ease: 'expo.out' },
          0.35,
        )
      }
      loops.push(
        gsap.fromTo(
          q('.sync-bar'),
          { scaleX: 0.3 },
          { scaleX: 0.7, duration: 8, ease: 'none', repeat: -1 },
        ),
      )
    }
    if (id === 'partners') deps.resetPartners?.()
    if (id === 'team') {
      deps.resetTeam()
      for (const b of s.querySelectorAll<HTMLElement>('.stats b')) {
        const o = { v: 0 }
        const to = Number(b.dataset.v) || 0
        tl.to(
          o,
          {
            v: to,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              b.textContent = String(Math.round(o.v))
            },
          },
          0.8,
        )
      }
    }
    tl.call(
      () => {
        for (const ln of q('.line.glitch')) deps.glitch(ln)
      },
      undefined,
      1.25,
    )
    if (id === 'social' && !mob) {
      tl.fromTo(
        q('.cmark'),
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.12 },
        0.9,
      )
      tl.fromTo(
        q('.cmt'),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.25 },
        1.2,
      )
    }
    return tl
  }
  const leave = (s: HTMLElement, dir: number) =>
    gsap.to(s.querySelectorAll('.char, [data-a]'), {
      y: -60 * dir,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.in',
      stagger: 0.004,
    })

  const mark = (i: number, duration: number) => {
    for (const [k, b] of dots.entries())
      b.setAttribute('aria-current', String(k === i))
    if (num) num.textContent = formatSceneNumber(i + 1)
    if (rail)
      gsap.to(rail, {
        scaleX: (i + 1) / scenes.length,
        duration,
        ease: 'power3.inOut',
      })
  }

  const go = (next: number) => {
    if (ctx.reduce) {
      scenes[next]?.scrollIntoView({ behavior: 'auto' })
      return
    }
    const target = Math.max(0, Math.min(scenes.length - 1, next))
    const cur = scenes[state.index]
    const nxt = scenes[target]
    if (target === state.index || state.animating || !cur || !nxt) return
    state.animating = true
    const dir = target > state.index ? 1 : -1
    stopLoops()
    deps.stage?.go(target)
    if (sweep)
      gsap.fromTo(
        sweep,
        { x: dir > 0 ? -window.innerWidth * 0.6 : window.innerWidth * 1.2 },
        {
          x: dir > 0 ? window.innerWidth * 1.2 : -window.innerWidth * 0.6,
          duration: 1.1,
          ease: 'power2.inOut',
        },
      )
    void leave(cur, dir).then(() => {
      cur.classList.remove('is-active')
      nxt.classList.add('is-active')
      if (nxt.id === 'social') deps.drawWaves()
      enter(nxt, dir)
      gsap.delayedCall(SETTLE_S, () => {
        state.animating = false
      })
    })
    state.index = target
    mark(target, 0.9)
    history.replaceState(null, '', `#${nxt.id}`)
  }

  for (const [i, b] of dots.entries())
    b.addEventListener('click', () => go(i), { signal })
  /* in-page links (header nav, CTAs to #scene) flip scenes instead of jumping */
  root.addEventListener(
    'click',
    (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!(a instanceof HTMLAnchorElement)) return
      const url = new URL(a.href)
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        !url.hash
      )
        return
      const k = scenes.findIndex((s) => `#${s.id}` === url.hash)
      if (k < 0) return
      e.preventDefault()
      go(k)
    },
    { signal },
  )

  /** Boots the scene shown by the URL hash; the intro promise gates its first entrance. */
  const start = (intro: Promise<void>) => {
    const ids = scenes.map((s) => s.id)
    const first = sceneFromHash({ hash: location.hash, ids })
    deps.drawWaves()
    if (ctx.reduce) {
      root.classList.add('is-static')
      for (const s of scenes) s.classList.add('is-active')
      mark(0, 0)
      requestAnimationFrame(() =>
        scenes[first]?.scrollIntoView({ behavior: 'auto' }),
      )
      return
    }
    for (const [i, s] of scenes.entries())
      s.classList.toggle('is-active', i === first)
    state.index = first
    mark(first, 0)
    /* hide the entrance targets until the intro lifts, so the first scene does not flash fully drawn */
    const firstScene = scenes[first]
    if (firstScene)
      gsap.set(firstScene.querySelectorAll('.char, [data-a]'), { opacity: 0 })
    void intro.then(() => {
      if (signal.aborted || !firstScene) return
      enter(firstScene, 1)
    })
    gsap.registerPlugin(Observer)
    const ownGesture = (t: EventTarget | null | undefined) =>
      t instanceof Element && Boolean(t.closest(OWN_GESTURES))
    const obs = Observer.create({
      target: window,
      type: 'wheel,touch',
      wheelSpeed: -1,
      tolerance: 12,
      preventDefault: true,
      ignore: OWN_GESTURES,
      onUp: (self) => {
        if (!state.dragging && !ownGesture(self.event?.target))
          go(state.index + 1)
      },
      onDown: (self) => {
        if (!state.dragging && !ownGesture(self.event?.target))
          go(state.index - 1)
      },
    })
    ctx.onDispose(() => obs.kill())
    /* a hash typed into the address bar (or a same-page link from outside the landing) flips to its scene;
       go() itself writes the hash with replaceState, which fires no hashchange */
    window.addEventListener(
      'hashchange',
      () => {
        /* unlike a wheel tick, a typed hash must not be lost to a running transition */
        const flip = () => {
          if (state.animating) gsap.delayedCall(0.3, flip)
          else go(sceneFromHash({ hash: location.hash, ids }))
        }
        flip()
      },
      { signal },
    )
    window.addEventListener(
      'keydown',
      (e) => {
        if (
          e.target instanceof Element &&
          e.target.closest('input, textarea, .ai-panel, [role="dialog"]')
        )
          return
        if (e.metaKey || e.ctrlKey || e.altKey) return
        const t = targetScene({
          key: e.key,
          index: state.index,
          count: scenes.length,
        })
        if (t === null) return
        e.preventDefault()
        go(t)
      },
      { signal },
    )
    const glitchTimer = window.setInterval(() => {
      const live = scenes[state.index]?.querySelectorAll('.glitch-auto')
      if (!live?.length) return
      const pick = live[Math.floor(Math.random() * live.length)]
      if (pick) deps.glitch(pick)
    }, GLITCH_EVERY_MS)
    ctx.onDispose(() => window.clearInterval(glitchTimer))
  }

  ctx.onDispose(stopLoops)
  return { go, start }
}
