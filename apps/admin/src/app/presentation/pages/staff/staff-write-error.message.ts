import { StaffWriteError } from '@domain/staff'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'

type StaffWriteOperation = 'create' | 'assign-role' | 'update-permissions' | 'deactivate'

type StaffWriteErrorInput = {
  error: unknown
  operation: StaffWriteOperation
  /** Distinguishes the update-permissions 400's two causes — see `to-staff-write-error.ts`. */
  targetIsBuiltInAdmin?: boolean
}

const DEFAULT_KEY: Record<StaffWriteOperation, string> = {
  create: 'operator.error.create',
  'assign-role': 'operator.error.assignRole',
  'update-permissions': 'operator.error.updatePermissions',
  deactivate: 'operator.error.deactivate',
}

/**
 * Turns a rejected staff write into a sentence an operator can act on. `'not-allowed'` on
 * update-permissions covers two distinct API refusals the response body does not distinguish
 * (see `to-staff-write-error.ts` in `infrastructure/staff`); `targetIsBuiltInAdmin` is what
 * lets this pick the right one.
 */
export function staffWriteError({
  error,
  operation,
  targetIsBuiltInAdmin,
}: StaffWriteErrorInput): Notice {
  if (!(error instanceof StaffWriteError)) return { key: DEFAULT_KEY[operation] }

  switch (error.reason) {
    case 'unknown-permission':
      return { key: 'operator.error.ungrantable' }
    case 'not-allowed':
      return {
        key: targetIsBuiltInAdmin ? 'operator.error.adminLocked' : 'operator.error.ungrantable',
      }
    case 'conflict':
      return { key: 'operator.error.conflict' }
    case 'last-admin':
      return { key: 'operator.error.lastAdmin' }
    case 'not-found':
      return {
        key:
          operation === 'create' || operation === 'assign-role'
            ? 'operator.error.roleGone'
            : 'operator.error.gone',
      }
    default:
      return { key: DEFAULT_KEY[operation] }
  }
}
