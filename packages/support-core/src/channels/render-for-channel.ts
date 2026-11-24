import type { Channel, Citation, Locale } from '../domain.js'
import { packBlocks } from '../text/pack-blocks.js'
import { splitParagraphs } from '../text/split-paragraphs.js'
import { formatInstagram } from './format-instagram.js'
import { formatTelegram } from './format-telegram.js'
import { formatWhatsapp } from './format-whatsapp.js'
import { formatWithinLimit } from './format-within-limit.js'
import { CHANNEL_MESSAGE_LIMITS } from './limits.js'
import { type MessengerChannel, sourcesBlock } from './sources-block.js'

/** An assistant or operator answer before channel formatting: Markdown plus its sources. */
export interface RenderableMessage {
  text: string
  citations: readonly Citation[]
}

const FORMATTERS: Record<MessengerChannel, (markdown: string) => string> = {
  telegram: formatTelegram,
  whatsapp: formatWhatsapp,
  instagram: formatInstagram,
}

/**
 * Converts an answer to the target channel and splits it into parts within the channel's
 * limit, at paragraph boundaries where possible. Web keeps Markdown: the widget renders
 * citations from the event stream.
 */
export function renderForChannel(
  message: RenderableMessage,
  channel: Channel,
  locale: Locale,
): string[] {
  if (channel === 'web') return [message.text]
  const format = FORMATTERS[channel]
  const limit = CHANNEL_MESSAGE_LIMITS[channel]

  const blocks = splitParagraphs(message.text).flatMap((paragraph) =>
    formatWithinLimit(paragraph, format, limit),
  )
  if (message.citations.length > 0) {
    const sources = sourcesBlock(message.citations, channel, locale)
    blocks.push(...formatWithinLimit(sources, (text) => text, limit))
  }
  return packBlocks(blocks, limit)
}
