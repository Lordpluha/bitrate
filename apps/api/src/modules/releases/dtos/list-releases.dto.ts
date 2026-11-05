import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ListReleasesSchema = z.strictObject(paginationQuerySchema.shape)

export class ListReleasesDto extends createZodDto(ListReleasesSchema) {}
