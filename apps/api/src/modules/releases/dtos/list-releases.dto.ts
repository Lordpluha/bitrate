import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'

export const ListReleasesSchema = paginationQuerySchema.strict()

export class ListReleasesDto extends createZodDto(ListReleasesSchema) {}
