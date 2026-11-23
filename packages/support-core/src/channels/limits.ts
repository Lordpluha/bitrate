import type { Channel } from '../domain.js'

/**
 * Maximum characters per message part. Telegram and WhatsApp allow 4096 and Instagram 1000;
 * the margin leaves room for formatting that the length check does not foresee.
 */
export const CHANNEL_MESSAGE_LIMITS: Record<Channel, number> = {
  web: Number.POSITIVE_INFINITY,
  telegram: 4000,
  whatsapp: 4000,
  instagram: 1000,
}
