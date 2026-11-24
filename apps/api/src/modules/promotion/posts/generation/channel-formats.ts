import type { PromotionChannel } from '@prisma/client'

/**
 * What each channel's draft is and how long it may be (spec D-14). TikTok and Shorts get a
 * 15-second hook script the artist records; the others get a caption.
 */
export const CHANNEL_FORMATS: Readonly<
  Record<PromotionChannel, { maxLength: number; format: string }>
> = {
  INSTAGRAM: { maxLength: 2_200, format: 'an Instagram caption' },
  TIKTOK: { maxLength: 600, format: 'a 15-second TikTok hook script with on-screen text' },
  TELEGRAM: { maxLength: 1_500, format: 'a Telegram channel post' },
  YOUTUBE_SHORTS: { maxLength: 600, format: 'a 15-second YouTube Shorts hook script' },
}
