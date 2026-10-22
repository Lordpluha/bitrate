/**
 * Thrown by a repository's `getById` when the API answers 404. Any other failed read reaches
 * presentation unchanged, so a screen can tell "this record does not exist" from "the request
 * failed" without touching a transport-shaped object.
 */
export class ResourceNotFoundError extends Error {
  constructor() {
    super('Resource not found')
    this.name = 'ResourceNotFoundError'
  }
}
