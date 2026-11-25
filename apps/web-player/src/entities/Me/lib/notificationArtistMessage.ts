import { z } from 'zod'

const artistMessageSchema = z.object({
  artistMessage: z.string().min(1),
  artistMessageAiGenerated: z.boolean().optional(),
})

export type NotificationArtistMessage = {
  text: string
  /** Drives the "Created with AI" marker (AI promotion, AC-9). */
  aiGenerated: boolean
}

type NotificationArtistMessageInput = {
  payload: unknown
}

/**
 * The artist's own message on a "New release" notification (AI promotion, AC-10); null when the
 * artist approved none, which leaves the notification as it always was.
 */
export const getNotificationArtistMessage = ({
  payload,
}: NotificationArtistMessageInput): NotificationArtistMessage | null => {
  const parsed = artistMessageSchema.safeParse(payload)
  if (!parsed.success) return null
  return {
    text: parsed.data.artistMessage,
    aiGenerated: parsed.data.artistMessageAiGenerated === true,
  }
}
