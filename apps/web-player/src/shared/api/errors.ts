export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isHttpStatus = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 100 &&
  value <= 599

export const getApiErrorStatus = (error: unknown) => {
  if (error instanceof ApiRequestError) return error.status
  if (!isRecord(error)) return undefined

  if (isHttpStatus(error.status)) return error.status
  if (isHttpStatus(error.statusCode)) return error.statusCode

  if (isRecord(error.response) && isHttpStatus(error.response.status)) {
    return error.response.status
  }

  return undefined
}

export const shouldRetryApiQuery = (failureCount: number, error: unknown) => {
  const status = getApiErrorStatus(error)

  if (status === 401 || status === 403 || status === 429) {
    return false
  }

  return failureCount < 2
}

export const ensureOkResponse = (response: Response, message: string) => {
  if (!response.ok) {
    throw new ApiRequestError(message, response.status)
  }
}
