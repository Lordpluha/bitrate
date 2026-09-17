import { RoleWriteError } from '@domain/role'

type RoleWriteErrorMessageInput = {
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
export function roleWriteErrorMessage({
  error,
  name,
  builtIn,
}: RoleWriteErrorMessageInput): string {
  if (!(error instanceof RoleWriteError)) return 'Could not save this role.'

  switch (error.reason) {
    case 'duplicate-name':
      return `A role named "${name}" already exists.`
    case 'not-allowed':
      return builtIn
        ? 'Built-in roles cannot be edited this way.'
        : 'This template includes a permission that cannot be granted.'
    case 'not-found':
      return 'This role no longer exists.'
    default:
      return 'Could not save this role.'
  }
}

/** The delete counterpart — `roles.ts` uses this from the list page. */
export function roleDeleteErrorMessage(error: unknown): string {
  if (!(error instanceof RoleWriteError)) return 'Could not delete this role.'

  switch (error.reason) {
    case 'in-use':
      return 'This role is still assigned to active operators.'
    case 'not-allowed':
      return 'Built-in roles cannot be deleted.'
    case 'not-found':
      return 'This role no longer exists.'
    default:
      return 'Could not delete this role.'
  }
}
