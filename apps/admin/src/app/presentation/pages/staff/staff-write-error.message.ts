import { StaffWriteError } from '@domain/staff'

export type StaffWriteOperation = 'create' | 'assign-role' | 'update-permissions' | 'deactivate'

type StaffWriteErrorMessageInput = {
  error: unknown
  operation: StaffWriteOperation
  /** Distinguishes the update-permissions 400's two causes — see `to-staff-write-error.ts`. */
  targetIsBuiltInAdmin?: boolean
}

const DEFAULT_MESSAGE: Record<StaffWriteOperation, string> = {
  create: 'Could not create this operator.',
  'assign-role': 'Could not reassign this role.',
  'update-permissions': 'Could not update permissions.',
  deactivate: 'Could not deactivate this operator.',
}

/**
 * Turns a rejected staff write into a sentence an operator can act on. `'not-allowed'` on
 * update-permissions covers two distinct API refusals the response body does not distinguish
 * (see `to-staff-write-error.ts` in `infrastructure/staff`); `targetIsBuiltInAdmin` is what
 * lets this pick the right one.
 */
export function staffWriteErrorMessage({
  error,
  operation,
  targetIsBuiltInAdmin,
}: StaffWriteErrorMessageInput): string {
  if (!(error instanceof StaffWriteError)) return DEFAULT_MESSAGE[operation]

  switch (error.reason) {
    case 'unknown-permission':
      return 'This permission set includes one that cannot be granted.'
    case 'not-allowed':
      return targetIsBuiltInAdmin
        ? 'The built-in ADMIN role always holds every permission and cannot have its permissions edited individually.'
        : 'This permission set includes one that cannot be granted.'
    case 'conflict':
      return 'That email or username is already in use.'
    case 'last-admin':
      return 'This would leave no active operator holding the ADMIN role.'
    case 'not-found':
      return operation === 'create' || operation === 'assign-role'
        ? 'That role no longer exists.'
        : 'This operator no longer exists.'
    default:
      return DEFAULT_MESSAGE[operation]
  }
}
