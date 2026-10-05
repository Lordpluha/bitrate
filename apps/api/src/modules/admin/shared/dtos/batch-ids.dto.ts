import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** The most ids one batch request may name; keeps a request's total work bounded. */
const BATCH_MAX_IDS = 100

/**
 * The body of every `POST /admin/<resource>/batch/<action>` route. Duplicate ids are accepted
 * here and collapsed by `runBatch`, so a double-click on a row never reports the same entity twice.
 */
export const BatchIdsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(BATCH_MAX_IDS),
})

export class BatchIdsDto extends createZodDto(BatchIdsSchema) {}
