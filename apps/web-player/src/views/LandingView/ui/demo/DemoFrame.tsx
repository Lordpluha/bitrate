'use client'

import { cn } from '@bitrate/ui-react'
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react'

type DemoFrameProps = {
  children: ReactNode
  className?: string
  /** Names the block for assistive technology. */
  label: string
}

/** Links inside the demo stay on the landing; in-page `#` links still work. */
const keepOnLanding = (event: MouseEvent<HTMLElement>) => {
  if (!(event.target instanceof Element)) return
  const link = event.target.closest('a[href]')
  if (link && !link.getAttribute('href')?.startsWith('#'))
    event.preventDefault()
}

const subscribeNever = () => () => undefined

/** The level a demo block's own headings take: the scene's heading above them is a level 2. */
const DEMO_HEADING_LEVEL = '3'

/**
 * The real blocks carry their page titles as `<h1>`/`<h2>`. Inside a landing scene they are
 * sub-headings, so the landing keeps one `<h1>` for assistive technology; demo blocks render in
 * the browser only, so crawlers never see their tags either.
 */
const demoteHeadings = (root: HTMLElement) => {
  for (const h of root.querySelectorAll('h1, h2'))
    if (h.getAttribute('aria-level') !== DEMO_HEADING_LEVEL) {
      /* an explicit role makes every engine read `aria-level`, not the tag's own level */
      h.setAttribute('role', 'heading')
      h.setAttribute('aria-level', DEMO_HEADING_LEVEL)
    }
}

/**
 * Hosts a real web-player block on the landing: the app's own type scale and colours instead
 * of the landing's, so the block looks exactly as it does in the player, and a click on any
 * of its links never navigates away. The block renders in the browser only: its demo player
 * state and relative times ("12 min ago") belong to the visit, not to the server render.
 */
export const DemoFrame = ({ children, className, label }: DemoFrameProps) => {
  const isClient = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  const frame = useRef<HTMLElement>(null)
  /* blocks mount lazily (Suspense, seeded queries): keep demoting what appears */
  useEffect(() => {
    const el = frame.current
    if (!el) return
    demoteHeadings(el)
    const watch = new MutationObserver(() => demoteHeadings(el))
    watch.observe(el, { childList: true, subtree: true })
    return () => watch.disconnect()
  }, [])

  return (
    <section
      aria-label={label}
      className={cn(
        'relative isolate overflow-hidden bg-background text-left text-base leading-normal font-normal tracking-normal text-foreground',
        className,
      )}
      onClickCapture={keepOnLanding}
      ref={frame}
    >
      {isClient ? children : null}
    </section>
  )
}
