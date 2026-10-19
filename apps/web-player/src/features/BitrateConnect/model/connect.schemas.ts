import { z } from 'zod'
import { trackResponseSchema } from '@/entities/Track'

/** `GET /me/player`: null until the account has played something. */
export const serverPlayerSchema = z
  .object({
    currentTrack: trackResponseSchema.nullable(),
    positionMs: z.number(),
    queue: z.array(z.object({ track: trackResponseSchema })),
    repeatMode: z.enum(['off', 'context', 'track']).catch('off'),
    shuffle: z.boolean(),
  })
  .nullable()

export const playerDeviceSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  lastSeenAt: z.coerce.date(),
  name: z.string(),
  type: z.enum(['web', 'desktop', 'mobile', 'speaker', 'other']),
})

export const playerDevicesSchema = z.array(playerDeviceSchema)

export type PlayerDevice = z.infer<typeof playerDeviceSchema>
