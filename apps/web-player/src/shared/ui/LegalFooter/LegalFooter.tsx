import { cn } from '@bitrate/ui-react'
import { LEGAL_DOCUMENTS } from '@shared/legal'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import type { ReactNode } from 'react'

type LegalFooterProps = {
  className?: string
  /** Shown above the links, e.g. the logo on pages without the player chrome. */
  leading?: ReactNode
}

/** Player footer: links to the legal documents this app actually publishes. */
export const LegalFooter = ({ className, leading }: LegalFooterProps) => (
  <footer
    className={cn(
      'flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 pb-8 text-xs text-muted-foreground',
      className,
    )}
  >
    {leading ? <div className="basis-full">{leading}</div> : null}
    <nav aria-label="Legal">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {LEGAL_DOCUMENTS.map((document) => (
          <li key={document.slug}>
            <Link
              className="transition-colors hover:text-foreground"
              href={ROUTES.legal(document.slug)}
            >
              {document.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
    <span>© 2026 Bitrate</span>
  </footer>
)
