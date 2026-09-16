import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'

/** Fields an operator can sort the operator directory by — all displayed, all cheap to
 * order. Never permissions, role, lockout state, or anything else sensitive/internal. */
export const ADMIN_STAFF_SORT_FIELDS = [
  'username',
  'email',
  'createdAt',
] as const satisfies readonly Prisma.StaffScalarFieldEnum[]

export const ListAdminStaffQuerySchema = paginationQuerySchema.merge(
  sortQuerySchema(ADMIN_STAFF_SORT_FIELDS),
)

export class ListAdminStaffQueryDto extends createZodDto(ListAdminStaffQuerySchema) {}
