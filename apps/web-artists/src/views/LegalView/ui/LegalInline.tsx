import { findLegalDocument } from '@shared/legal'
import { ROUTES } from '@shared/routes/routes'
import type { ReactNode } from 'react'

/** Matches `**bold**` and `[label](slug)` — the only inline markup the legal texts use. */
const INLINE_MARKUP = /\*\*([^*]+)\*\*|\[([^[\]]+)\]\(([a-z-]+)\)/g

type LegalInlineProps = {
  text: string
}

/** Renders one run of legal text; a link to a document this app does not publish is plain text. */
export const LegalInline = ({ text }: LegalInlineProps) => {
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const match of text.matchAll(INLINE_MARKUP)) {
    const [whole, bold, label, slug] = match
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index))

    if (bold !== undefined) {
      nodes.push(<strong key={match.index}>{bold}</strong>)
    } else if (label !== undefined && slug !== undefined) {
      nodes.push(
        findLegalDocument({ slug }) ? (
          <a
            className="text-primary underline hover:opacity-70"
            href={ROUTES.legal(slug)}
            key={match.index}
          >
            {label}
          </a>
        ) : (
          label
        ),
      )
    }

    cursor = match.index + whole.length
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))

  return <>{nodes}</>
}
