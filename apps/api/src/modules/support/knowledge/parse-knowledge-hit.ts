import type { KnowledgeHit } from '@bitrate/support-core'
import { z } from 'zod'

const payloadSchema = z.object({
  chunkId: z.string().min(1),
  title: z.string().min(1),
  text: z.string(),
  url: z.string().optional(),
})

/** A Qdrant search point as a `KnowledgeHit`; `undefined` for a point with a foreign payload. */
export function parseKnowledgeHit(point: {
  score: number
  payload?: unknown
}): KnowledgeHit | undefined {
  const parsed = payloadSchema.safeParse(point.payload)
  if (!parsed.success) return undefined
  const { chunkId, title, text, url } = parsed.data
  return url === undefined
    ? { chunkId, title, text, score: point.score }
    : { chunkId, title, text, url, score: point.score }
}
