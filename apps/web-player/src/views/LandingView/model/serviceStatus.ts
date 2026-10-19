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
