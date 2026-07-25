export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export const ensureOkResponse = (response: Response, message: string) => {
  if (!response.ok) {
    throw new ApiRequestError(message, response.status)
  }
}
