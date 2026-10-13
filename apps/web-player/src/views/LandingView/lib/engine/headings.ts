import { all, type EngineContext } from './context'
import { isLightTheme, mixRgb, type PaletteToken, token } from './palette'

const GLITCH_MS = 700
/** Highlight ramps per theme: violet → magenta → blue, deeper on light backgrounds for contrast. */
const RAMP: Record<
  'light' | 'dark',
  readonly [PaletteToken, PaletteToken, PaletteToken]
> = {
  light: ['purple-500', 'magenta-500', 'blue-600'],
  dark: ['purple-400', 'magenta-500', 'blue-400'],
}

/** Splits text nodes into per-character spans (words stay unbroken) so headings can animate letter by letter. */
const splitChars = (node: Node) => {
  for (const n of [...node.childNodes]) {
    if (n.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      for (const w of (n.textContent ?? '').split(/(\s+)/)) {
        if (!w) continue
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(' '))
          continue
        }
        const word = document.createElement('span')
        word.style.display = 'inline-block'
        word.style.whiteSpace = 'nowrap'
        for (const ch of w) {
          const c = document.createElement('span')
          c.className = 'char'
          c.textContent = ch
          word.appendChild(c)
        }
        frag.appendChild(word)
      }
      n.replaceWith(frag)
    } else if (n.nodeType === Node.ELEMENT_NODE) splitChars(n)
  }
}

/**
 * Headline effects. Gradient words get one colour per letter (background-clip:text does not paint
 * through inline-block children); lines with an accent word glitch on hover and on scene entry.
 */
export const mountHeadings = (ctx: EngineContext) => {
  const { root, signal } = ctx
  for (const span of all({ root, selector: '.line > span', type: HTMLElement }))
    splitChars(span)

  const paint = () => {
    const [a, b, c] = RAMP[isLightTheme() ? 'light' : 'dark'].map(token)
    if (!a || !b || !c) return
    for (const hl of all({ root, selector: '.hl', type: HTMLElement })) {
      hl.classList.add('split')
      const chars = all({ root: hl, selector: '.char', type: HTMLElement })
      chars.forEach((ch, i) => {
        const t = chars.length > 1 ? i / (chars.length - 1) : 0
        ch.style.color =
          t < 0.6
            ? mixRgb({ a, b, t: t / 0.6 })
            : mixRgb({ a: b, b: c, t: (t - 0.6) / 0.4 })
      })
    }
  }
  paint()

  const timers = new Set<number>()
  const glitch = (el: Element) => {
    el.classList.remove('is-glitching')
    requestAnimationFrame(() => el.classList.add('is-glitching'))
    const id = window.setTimeout(() => {
      el.classList.remove('is-glitching')
      timers.delete(id)
    }, GLITCH_MS)
    timers.add(id)
  }
  ctx.onDispose(() => {
    for (const id of timers) window.clearTimeout(id)
  })
  for (const ln of all({ root, selector: '.line', type: HTMLElement })) {
    if (!ln.querySelector('.hl')) continue
    ln.classList.add('glitch')
    ln.dataset.text = ln.textContent ?? ''
    ln.addEventListener('pointerenter', () => glitch(ln), { signal })
  }
  return { paint, glitch }
}
