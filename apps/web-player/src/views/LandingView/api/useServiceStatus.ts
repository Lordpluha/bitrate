'use client'

import { useQuery } from '@shared/api/client'
import { type ServiceState, serviceStateFrom } from '../model/serviceStatus'

const POLL_MS = 60_000

/** Service status: overall API readiness every minute while the tab is visible. */
export const useServiceStatus = (): {
  state: ServiceState
  checkedAt: number | null
} => {
  const query = useQuery(
    'get',
    '/api/v1/health/ready',
    {},
    {
      refetchInterval: POLL_MS,
      refetchIntervalInBackground: false,
      retry: false,
      /* the footer pill reports the failure itself, so no error toast */
      meta: { suppressErrorToast: true },
    },
  )
  const checkedAt = Math.max(query.dataUpdatedAt, query.errorUpdatedAt) || null
  return { state: serviceStateFrom(query), checkedAt }
}
