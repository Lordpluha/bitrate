import { z } from 'zod'

/** The take-down visibility filter every soft-deletable admin resource list shares. Defaults
 * to `active` in the service layer, never in the schema — see `paginationQuerySchema`'s note
 * on why a default stays out of the generated contract. */
export const ADMIN_RESOURCE_STATUSES = ['active', 'deactivated', 'all'] as const

export type AdminResourceStatus = (typeof ADMIN_RESOURCE_STATUSES)[number]

export const adminResourceStatusSchema = z.enum(ADMIN_RESOURCE_STATUSES)
