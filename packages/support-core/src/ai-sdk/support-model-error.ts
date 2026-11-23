/** A model call failed at the provider (network, overload, refusal of the request). */
export class SupportModelError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'SupportModelError'
  }
}
