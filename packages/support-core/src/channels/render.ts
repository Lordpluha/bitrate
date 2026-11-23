import type { Channel, Citation, Locale } from '../domain.js'

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

  const blocks = message.text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
    .flatMap((paragraph) => formatWithinLimit(paragraph, format, limit))
  if (message.citations.length > 0) {
    blocks.push(
      ...formatWithinLimit(sourcesBlock(message.citations, channel, locale), (s) => s, limit),
    )
  }
  return pack(blocks, limit)
}

const FORMATTERS: Record<Exclude<Channel, 'web'>, Formatter> = {
  telegram: (markdown) =>
    markdown
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replace(/^#{1,6}\s+(.+?)\s*#*$/gm, '<b>$1</b>')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=$|[^\w*])/gm, '$1<i>$2</i>')
      .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>'),
  whatsapp: (markdown) =>
    markdown
      .replace(/^#{1,6}\s+(.+?)\s*#*$/gm, '*$1*')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/\*\*([^*\n]+)\*\*/g, '*$1*')
      .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1 ($2)'),
  instagram: (markdown) =>
    markdown
      .replace(/^#{1,6}\s+(.+?)\s*#*$/gm, '$1')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/`([^`\n]+)`/g, '$1')
      .replace(/\*\*([^*\n]+)\*\*/g, '$1')
      .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=$|[^\w*])/gm, '$1$2')
      .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1 ($2)'),
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
