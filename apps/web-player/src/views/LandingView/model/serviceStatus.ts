/** What the footer pill says about the platform. */
export type ServiceState =
  | 'checking'
  | 'operational'
  | 'degraded'
  | 'unreachable'

/** The parts of a readiness query result the state depends on. */
export type ReadinessResult = {
  isPending: boolean
  isSuccess: boolean
  error: unknown
}

/* A thrown Error (fetch failure, abort, timeout) means the API could not be reached; any other
   error is the API's own "not ready" answer, i.e. it is up but degraded. */
export const serviceStateFrom = ({
  isPending,
  isSuccess,
  error,
}: ReadinessResult): ServiceState => {
  if (isSuccess) return 'operational'
  if (isPending && !error) return 'checking'
  if (
    error instanceof Error ||
    (typeof DOMException !== 'undefined' && error instanceof DOMException)
  )
    return 'unreachable'
  return error ? 'degraded' : 'checking'
}

/** What the web player's own `/api/health` route reports about the frontends it can see. */
export type FrontHealthReport = { webArtists: 'ok' | 'down' }

/** A frontend the footer lists: the web player itself or the artist portal. */
export type FrontId = 'web' | 'artists'

/**
 * A frontend's state from the web player's health route: the route answering at all means the
 * web player is up; the artist portal is what the web player's server saw when it asked.
 */
export const frontStateFrom = ({
  result,
  report,
  id,
}: {
  result: ReadinessResult
  report: FrontHealthReport | undefined
  id: FrontId
}): ServiceState => {
  const web = serviceStateFrom(result)
  if (id === 'web' || web !== 'operational') return web
  if (!report) return 'checking'
  return report.webArtists === 'ok' ? 'operational' : 'unreachable'
}

/** The pill's summary of every service: one failing service degrades it, all failing loses it. */
export const overallState = (states: readonly ServiceState[]): ServiceState => {
  const failed = states.filter((s) => s === 'unreachable' || s === 'degraded')
  if (failed.length === 0)
    return states.includes('checking') ? 'checking' : 'operational'
  return failed.length === states.length &&
    states.every((s) => s === 'unreachable')
    ? 'unreachable'
    : 'degraded'
}
