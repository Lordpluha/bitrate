/** Configuration names a model that cannot be used; raised at startup, never per request. */
export class PromotionModelConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromotionModelConfigError'
  }
}
