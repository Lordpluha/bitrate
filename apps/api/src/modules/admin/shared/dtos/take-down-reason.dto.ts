import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * The optional `reason` body accepted by every destructive/restorative operator action
 * (take-down, restore, session revoke). Trimmed and bounded so it fits an `AuditLog.metadata`
 * entry without needing a schema change.
 */
export const TakeDownReasonSchema = z.object({
  reason: z.string().trim().min(1).max(500).optional(),
})

export class TakeDownReasonDto extends createZodDto(TakeDownReasonSchema) {}
