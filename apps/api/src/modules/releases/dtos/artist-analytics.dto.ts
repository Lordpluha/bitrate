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
