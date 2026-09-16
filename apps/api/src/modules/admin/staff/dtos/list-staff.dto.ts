import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'

export const ListAdminStaffQuerySchema = paginationQuerySchema

export class ListAdminStaffQueryDto extends createZodDto(ListAdminStaffQuerySchema) {}
