import { RoleWriteError } from '@domain/role'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'

type RoleWriteErrorInput = {
  error: unknown
  /** The name the operator typed, for the duplicate-name message. */
  name: string
  /** Whether the role being edited is built-in — `undefined` when creating. */
  builtIn?: boolean
}

/**
 * Turns a rejected create/update into a sentence an operator can act on. `'not-allowed'` covers
 * two distinct API refusals the response body does not distinguish (see `to-role-write-error.ts`
 * in `infrastructure/roles`); `builtIn` is what lets this pick the right one.
 */
export function roleWriteError({ error, name, builtIn }: RoleWriteErrorInput): Notice {
  if (!(error instanceof RoleWriteError)) return { key: 'role.error.save' }

  switch (error.reason) {
    case 'duplicate-name':
      return { key: 'role.error.duplicate', params: { name } }
    case 'not-allowed':
      return { key: builtIn ? 'role.error.builtIn' : 'role.error.ungrantable' }
    case 'not-found':
      return { key: 'role.error.gone' }
    default:
      return { key: 'role.error.save' }
  }
}

/** The delete counterpart — `roles.ts` uses this from the list page. */
export function roleDeleteError(error: unknown): Notice {
  if (!(error instanceof RoleWriteError)) return { key: 'roles.error.delete' }

  switch (error.reason) {
    case 'in-use':
      return { key: 'roles.error.inUse' }
    case 'not-allowed':
      return { key: 'roles.error.builtIn' }
    case 'not-found':
      return { key: 'roles.error.gone' }
    default:
      return { key: 'roles.error.delete' }
  }
}
