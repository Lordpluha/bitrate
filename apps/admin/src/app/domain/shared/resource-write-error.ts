/**
 * Why the API refused a take-down/restore write. `infrastructure/http/to-resource-write-error.ts`
 * is the only place that ever inspects an HTTP status for these — this is what reaches
 * presentation instead, so a component never touches a transport-shaped object.
 */
export type ResourceWriteFailureReason =
  'already-deactivated' | 'not-deactivated' | 'not-found' | 'unknown'

/**
 * Thrown by `UserRepository`/`ArtistRepository`'s `deactivate`/`restore` when the API refuses
 * the write — most commonly a 409 because the account's state already changed elsewhere.
 */
export class ResourceWriteError extends Error {
  constructor(readonly reason: ResourceWriteFailureReason) {
    super(`Resource write refused: ${reason}`)
    this.name = 'ResourceWriteError'
  }
}
