/**
 * Why the API refused a role write. `infrastructure/roles` is the only place that ever inspects
 * an HTTP status — this is what reaches presentation instead, so a component never touches a
 * transport-shaped object.
 */
export type RoleWriteFailureReason =
  | 'duplicate-name'
  | 'not-allowed'
  | 'in-use'
  | 'not-found'
  | 'unknown'

/** Thrown by `RoleRepository.create` / `.update` / `.delete` when the API refuses the write. */
export class RoleWriteError extends Error {
  constructor(readonly reason: RoleWriteFailureReason) {
    super(`Role write refused: ${reason}`)
    this.name = 'RoleWriteError'
  }
}
