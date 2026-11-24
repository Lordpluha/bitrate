import type { AnchorHTMLAttributes, MouseEvent, Ref } from 'react'
import { isInAppHref } from './isInAppHref'
import { type NextHref, resolveHref } from './resolveHref'
import { useNavigateHref } from './useNavigateHref'

/** The `next/link` props the reused web-player code passes. */
export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: NextHref
  replace?: boolean
  scroll?: boolean
  /** Accepted for compatibility; a local SPA has nothing to prefetch. */
  prefetch?: boolean | null
  ref?: Ref<HTMLAnchorElement>
}

/** A click the browser should handle itself: new tab/window, download, or a modified click. */
const isBrowserHandledClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.defaultPrevented ||
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  (event.currentTarget.target && event.currentTarget.target !== '_self') ||
  event.currentTarget.hasAttribute('download')

/** `next/link` for the desktop renderer: in-app hrefs go through the router history. */
export default function Link({
  href,
  replace,
  scroll,
  prefetch: _prefetch,
  onClick,
  ref,
  ...anchorProps
}: LinkProps) {
  const navigate = useNavigateHref()
  const path = resolveHref(href)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (isBrowserHandledClick(event) || !isInAppHref(path)) return

    event.preventDefault()
    navigate(path, { replace, scroll })
  }

  return <a {...anchorProps} href={path} onClick={handleClick} ref={ref} />
}
