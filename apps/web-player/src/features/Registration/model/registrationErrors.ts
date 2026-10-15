import type { RegistrationFormData } from '@entities/User'
import type { FieldError, FieldErrors } from 'react-hook-form'

/** Order the messages appear in: the order of the form. */
const FIELD_ORDER = [
  'fullName',
  'email',
  'password',
  'confirmPassword',
  'acceptLegal',
] as const satisfies readonly (keyof RegistrationFormData)[]

const messagesOf = (error: FieldError | undefined) => {
  if (!error) return []
  const fromTypes = Object.values(error.types ?? {}).flatMap((value) =>
    Array.isArray(value) ? value : [value],
  )
  return [error.message, ...fromTypes].filter(
    (message): message is string =>
      typeof message === 'string' && message.length > 0,
  )
}

/**
 * Every validation message of the sign-up form, each once, as the design lists them under the
 * fields (all broken password rules, not just the first). Needs `criteriaMode: 'all'`.
 */
export const collectRegistrationErrors = (
  errors: FieldErrors<RegistrationFormData>,
) => [...new Set(FIELD_ORDER.flatMap((field) => messagesOf(errors[field])))]
