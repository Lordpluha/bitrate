import { z } from 'zod'
import { PROTECTED_PERMISSIONS } from '@domain/access'
import type { Permission } from '@domain/access'

const PROTECTED_SET = new Set<Permission>(PROTECTED_PERMISSIONS)

/** The API's own floor, surfaced here as a validation message rather than only a server 400. */
const MIN_PASSWORD_LENGTH = 12

/**
 * What the create form accepts. The permission grid already hides protected permissions, so
 * the `.refine` only ever fires against a value the UI could not itself have produced — still
 * worth stating, since a schema is the contract even when the widget in front of it behaves.
 */
export const staffCreateSchema = z.object({
  email: z.email('Enter a valid email address'),
  username: z.string().min(1, 'Username is required'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  roleId: z.string().min(1, 'Choose a role'),
  permissions: z
    .array(z.custom<Permission>())
    .refine((permissions) => permissions.every((permission) => !PROTECTED_SET.has(permission)), {
      message: 'A protected permission cannot be granted',
    }),
})

export type StaffCreateValues = z.infer<typeof staffCreateSchema>
