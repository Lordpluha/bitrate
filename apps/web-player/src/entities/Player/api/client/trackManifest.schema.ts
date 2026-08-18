import { z } from 'zod'

/** `[startTicks, durationTicks, offset, length]` */
const fragmentSchema = z.tuple([z.number(), z.number(), z.number(), z.number()])

const renditionSchema = z.object({
  bitrate: z.number(),
  codec: z.string(),
  size: z.number(),
  initRange: z.tuple([z.number(), z.number()]),
  fragments: z.array(fragmentSchema),
})

export const trackManifestSchema = z.object({
  version: z.number(),
  timescale: z.number(),
  durationTicks: z.number(),
  durationMs: z.number(),
  renditions: z.array(renditionSchema).min(1),
})
