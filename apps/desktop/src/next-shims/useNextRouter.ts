import { useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import type { NextHref } from './resolveHref'
import { type NavigateHrefOptions, useNavigateHref } from './useNavigateHref'

/** The `AppRouterInstance` surface the reused web-player code calls. */
export type NextRouter = {
  push: (href: NextHref, options?: Pick<NavigateHrefOptions, 'scroll'>) => void
  replace: (href: NextHref, options?: Pick<NavigateHrefOptions, 'scroll'>) => void
  back: () => void
  forward: () => void
  /** Next re-renders server components here; the SPA re-runs route loaders instead. */
  refresh: () => void
  prefetch: (href: NextHref) => void
}

/** `useRouter` from `next/navigation`, backed by TanStack Router. */
export const useNextRouter = (): NextRouter => {
  const router = useRouter()
  const navigate = useNavigateHref()

  return useMemo(
    () => ({
      push: (href, options) => navigate(href, options),
      replace: (href, options) => navigate(href, { ...options, replace: true }),
      back: () => router.history.back(),
      forward: () => router.history.forward(),
      refresh: () => {
        void router.invalidate()
      },
      prefetch: () => undefined,
    }),
    [navigate, router],
  )
}
