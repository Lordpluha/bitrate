/**
 * A rule said no before the request was made. Distinct from a failed request on purpose: the
 * operator needs "that is not allowed here", not "something went wrong".
 *
 * `name` is assigned rather than inferred from the class, because a production build renames
 * classes — `instanceof` is the reliable discriminator, and this is for the message.
 */
export class ActionNotAllowedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActionNotAllowedError'
  }
}
