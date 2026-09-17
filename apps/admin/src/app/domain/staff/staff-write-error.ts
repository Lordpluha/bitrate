/**
 * Why the API refused a staff write. `infrastructure/staff` is the only place that ever
 * inspects an HTTP status — this is what reaches presentation instead, so a component never
 * touches a transport-shaped object.
 */
export type StaffWriteFailureReason =
  'unknown-permission' | 'not-allowed' | 'conflict' | 'last-admin' | 'not-found' | 'unknown'

/**
 * Thrown by `StaffRepository.create` / `.assignRole` / `.updatePermissions` / `.deactivate`
 * when the API refuses the write.
 */
export class StaffWriteError extends Error {
  constructor(readonly reason: StaffWriteFailureReason) {
    super(`Staff write refused: ${reason}`)
    this.name = 'StaffWriteError'
  }
}
