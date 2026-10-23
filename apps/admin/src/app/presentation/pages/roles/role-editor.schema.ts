import * as z from 'zod'
import { PROTECTED_PERMISSIONS } from '@domain/access'
import type { Permission } from '@domain/access'

const PROTECTED_SET = new Set<Permission>(PROTECTED_PERMISSIONS)

/**
 * What the create/edit form accepts. The permission grid already hides protected permissions,
 * so this `.refine` only ever fires against a value the UI could not itself have produced —
 * still worth stating, since a schema is the contract even when the widget in front of it is
 * well-behaved today. Messages are transloco keys; the editor translates them on show.
 */
export const roleEditorSchema = z.object({
  name: z.string().min(1, 'role.invalid.nameRequired').max(100, 'role.invalid.nameTooLong'),
  description: z.string().max(500, 'role.invalid.descriptionTooLong'),
  permissions: z
    .array(z.custom<Permission>())
    .refine((permissions) => permissions.every((permission) => !PROTECTED_SET.has(permission)), {
      message: 'role.invalid.protected',
    }),
})
