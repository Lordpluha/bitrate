import type { Citation, Locale } from '../domain.js'
import { escapeHtml } from './escape-html.js'

/** A messenger: the channels that receive rendered text instead of a stream. */
export type MessengerChannel = 'telegram' | 'whatsapp' | 'instagram'

const SOURCES_LABEL: Record<Locale, string> = {
  en: 'Sources',
  uk: 'Джерела',
  pl: 'Źródła',
}

/** The localized source list appended to an answer, already in the channel's format. */
export function sourcesBlock(
  citations: readonly Citation[],
  channel: MessengerChannel,
  locale: Locale,
): string {
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
