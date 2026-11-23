import type { Channel, Citation, Locale } from '../domain.js'
import { listItemContent, parseHeading, splitLines, splitParagraphs } from '../text/markdown.js'

/** An assistant or operator answer before channel formatting: Markdown plus its sources. */
export interface RenderableMessage {
  text: string
  citations: readonly Citation[]
}

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

const SOURCES_LABEL: Record<Locale, string> = {
  en: 'Sources',
  uk: 'Джерела',
  pl: 'Źródła',
}

type Formatter = (markdown: string) => string

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
    blocks.push(
      ...formatWithinLimit(sourcesBlock(message.citations, channel, locale), (s) => s, limit),
    )
  }
  return pack(blocks, limit)
}

/*
 * Inline patterns. Each repeated class excludes the delimiter that ends it (and `[` for
 * links), so a failed match stops at the next delimiter and a whole pass stays linear.
 * Headings and list items are handled per line by `transformLines`, without regexes.
 */
const CODE = /`([^`\n]+)`/g
const BOLD = /\*\*([^*\n]+)\*\*/g
const ITALIC = /(^|[^\w*])[*_]([^*_\n]+)[*_](?=$|[^\w*])/gm
const LINK = /\[([^[\]\n]+)\]\(([^()\s]+)\)/g

/** Rewrites ATX headings with `heading` and bullet markers as `• `. */
function transformLines(markdown: string, heading: (text: string) => string): string {
  return splitLines(markdown)
    .map((line) => {
      const title = parseHeading(line)
      if (title !== undefined) return heading(title)
      const item = listItemContent(line)
      return item === undefined ? line : `• ${item}`
    })
    .join('\n')
}

const FORMATTERS: Record<Exclude<Channel, 'web'>, Formatter> = {
  telegram: (markdown) =>
    transformLines(escapeHtml(markdown), (title) => `<b>${title}</b>`)
      .replace(CODE, '<code>$1</code>')
      .replace(BOLD, '<b>$1</b>')
      .replace(ITALIC, '$1<i>$2</i>')
      .replace(LINK, '<a href="$2">$1</a>'),
  whatsapp: (markdown) =>
    transformLines(markdown, (title) => `*${title}*`)
      .replace(BOLD, '*$1*')
      .replace(LINK, '$1 ($2)'),
  instagram: (markdown) =>
    transformLines(markdown, (title) => title)
      .replace(CODE, '$1')
      .replace(BOLD, '$1')
      .replace(ITALIC, '$1$2')
      .replace(LINK, '$1 ($2)'),
}

function sourcesBlock(citations: readonly Citation[], channel: Channel, locale: Locale): string {
  const label = SOURCES_LABEL[locale]
  if (channel === 'telegram') {
    const lines = citations.map((citation) => {
      const title = escapeHtml(citation.title)
      return citation.url ? `• <a href="${escapeHtml(citation.url)}">${title}</a>` : `• ${title}`
    })
    return [`<b>${label}</b>`, ...lines].join('\n')
  }
  const lines = citations.map((citation) =>
    citation.url ? `• ${citation.title} (${citation.url})` : `• ${citation.title}`,
  )
  const heading = channel === 'whatsapp' ? `*${label}*` : `${label}:`
  return [heading, ...lines].join('\n')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Formats a paragraph; if the result is too long, formats word groups that fit. */
function formatWithinLimit(paragraph: string, format: Formatter, limit: number): string[] {
  const formatted = format(paragraph)
  if (formatted.length <= limit) return [formatted]
  const pieces: string[] = []
  let current = ''
  for (const word of paragraph.split(/\s+/)) {
    const candidate = current === '' ? word : `${current} ${word}`
    if (format(candidate).length <= limit) {
      current = candidate
    } else {
      if (current !== '') pieces.push(format(current))
      current = word
    }
  }
  if (current !== '') pieces.push(format(current).slice(0, limit))
  return pieces
}

function pack(blocks: readonly string[], limit: number): string[] {
  const parts: string[] = []
  let current = ''
  for (const block of blocks) {
    const candidate = current === '' ? block : `${current}\n\n${block}`
    if (candidate.length <= limit) {
      current = candidate
    } else {
      if (current !== '') parts.push(current)
      current = block
    }
  }
  if (current !== '') parts.push(current)
  return parts
}
