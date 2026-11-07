import { useI18n } from '@shared/i18n'
import { useIsFetching } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LoadingProgress } from './LoadingProgress'

export function RouteProgress() {
  const { t } = useI18n()
  // SSR paints the indicator while client bundles are still downloading.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const navigating = useRouterState({ select: (state) => state.isLoading })
  // Ignore preloads without observers and silent refreshes of already displayed data.
  const loading = useIsFetching({
    predicate: (query) => query.isActive() && query.state.data === undefined,
  })
  return (
    <LoadingProgress
      active={!hydrated || navigating || loading > 0}
      initiallyVisible
      label={t('common.loadingPage')}
    />
  )
}
