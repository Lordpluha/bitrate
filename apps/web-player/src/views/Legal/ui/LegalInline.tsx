import { findLegalDocument } from '@shared/legal'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import type { ReactNode } from 'react'

/** Matches `**bold**` and `[label](slug)` — the only inline markup the legal texts use. */
const INLINE_MARKUP = /\*\*([^*]+)\*\*|\[([^[\]]+)\]\(([a-z-]+)\)/g

type LegalInlineProps = {
  text: string
}

/**
 * Renders one run of legal text. A link to a document this app does not publish (the Artist
 * Agreement, for listeners) is shown as plain text rather than as a dead link.
 */
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
          <Link
            className="text-primary underline hover:opacity-70"
            href={ROUTES.legal(slug)}
            key={match.index}
          >
            {label}
          </Link>
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
