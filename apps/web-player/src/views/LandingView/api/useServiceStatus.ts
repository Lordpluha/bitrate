'use client'

import { useQuery } from '@shared/api/client'
import { useQuery as useAppQuery } from '@tanstack/react-query'
import { z } from 'zod'
import {
  type FrontHealthReport,
  frontStateFrom,
  overallState,
  type ServiceState,
  serviceStateFrom,
} from '../model/serviceStatus'

const POLL_MS = 60_000
/** The web player's own health route (a Next.js route handler, not the API). */
const FRONT_HEALTH_PATH = '/api/health'

const frontHealthSchema = z.object({ webArtists: z.enum(['ok', 'down']) })

/** One row of the status panel. */
export type ServiceRow = {
  id: 'api' | 'web' | 'artists'
  state: ServiceState
}

const fetchFrontHealth = async (): Promise<FrontHealthReport> => {
  const res = await fetch(FRONT_HEALTH_PATH, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Health route answered ${res.status}`)
  return frontHealthSchema.parse(await res.json())
}

/**
 * Service status every minute while the tab is visible: API readiness straight from the API,
 * the web player and the artist portal from the web player's own health route.
 */
export const useServiceStatus = (): {
  state: ServiceState
  rows: ServiceRow[]
  checkedAt: number | null
} => {
  const api = useQuery(
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
  const front = useAppQuery({
    queryKey: ['landing', 'front-health'],
    queryFn: fetchFrontHealth,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    retry: false,
    meta: { suppressErrorToast: true },
  })
  const rows: ServiceRow[] = [
    { id: 'api', state: serviceStateFrom(api) },
    {
      id: 'web',
      state: frontStateFrom({ result: front, report: front.data, id: 'web' }),
    },
    {
      id: 'artists',
      state: frontStateFrom({
        result: front,
        report: front.data,
        id: 'artists',
      }),
    },
  ]
  const checkedAt =
    Math.max(
      api.dataUpdatedAt,
      api.errorUpdatedAt,
      front.dataUpdatedAt,
      front.errorUpdatedAt,
    ) || null
  return {
    state: overallState(rows.map((r) => r.state)),
    rows,
    checkedAt,
  }
}
