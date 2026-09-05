import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateSettingsSchema = z.object({
  language: z.string().min(2).max(10).optional(),
  streamingQuality: z.enum(['automatic', 'low', 'normal', 'high', 'very-high']).optional(),
  normalizeVolume: z.boolean().optional(),
  compactLibrary: z.boolean().optional(),
  showNowPlaying: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  explicitContent: z.boolean().optional(),
  privateSession: z.boolean().optional(),
})
export class UpdateSettingsDto extends createZodDto(UpdateSettingsSchema) {}

export const UpdatePlayerSchema = z.object({
  deviceId: z.uuid().nullable().optional(),
  currentTrackId: z.uuid().nullable().optional(),
  contextType: z.enum(['playlist', 'album', 'artist', 'queue']).nullable().optional(),
  contextId: z.uuid().nullable().optional(),
  positionMs: z.number().int().min(0).optional(),
  isPlaying: z.boolean().optional(),
  shuffle: z.boolean().optional(),
  repeatMode: z.enum(['off', 'context', 'track']).optional(),
})
export class UpdatePlayerDto extends createZodDto(UpdatePlayerSchema) {}

export const UpdateQueueSchema = z.object({
  trackIds: z.array(z.uuid()).max(500),
})
export class UpdateQueueDto extends createZodDto(UpdateQueueSchema) {}

export const UpsertDeviceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1).max(100),
  type: z.enum(['web', 'desktop', 'mobile', 'speaker', 'other']),
  isActive: z.boolean().optional(),
})
export class UpsertDeviceDto extends createZodDto(UpsertDeviceSchema) {}
