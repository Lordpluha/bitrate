import { useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'
import { type NextHref, resolveHref } from './resolveHref'

/** Options Next's `router.push` / `<Link>` accept and the desktop router honours. */
export type NavigateHrefOptions = {
  replace?: boolean
  /** Next scrolls to the top after a navigation unless this is `false`. */
  scroll?: boolean
}

/** Navigates the renderer to a Next.js-style `href` through the TanStack Router history. */
export const useNavigateHref = () => {
  const router = useRouter()

  return useCallback(
    (href: NextHref, { replace = false, scroll = true }: NavigateHrefOptions = {}) => {
      const path = resolveHref(href)
      if (replace) router.history.replace(path)
      else router.history.push(path)
      if (scroll) window.scrollTo({ top: 0 })
    },
    [router],
  )
}
