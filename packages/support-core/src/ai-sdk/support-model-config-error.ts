/** A model id from configuration cannot be resolved; raised at startup, not per message. */
export class SupportModelConfigError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'SupportModelConfigError'
  }
}
