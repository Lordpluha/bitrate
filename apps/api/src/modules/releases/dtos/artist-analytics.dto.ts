import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ArtistAnalyticsSchema = z.strictObject({
  days: z.coerce
    .number()
    .int()
    .pipe(z.union([z.literal(7), z.literal(28), z.literal(90)]))
    .default(28)
    .describe('Period length in whole UTC days ending today'),
})

export class ArtistAnalyticsDto extends createZodDto(ArtistAnalyticsSchema) {}

export const ArtistTopTracksSchema = ArtistAnalyticsSchema.extend({
  page: z.coerce.number().int().min(1).max(2_147_483_647).default(1),
})

export class ArtistTopTracksDto extends createZodDto(ArtistTopTracksSchema) {}
