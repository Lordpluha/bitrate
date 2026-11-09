'use client'

import { Label } from '@bitrate/ui-react'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

const LINK_CLASS =
  'underline decoration-border underline-offset-2 hover:decoration-current'

/** The three documents, by the `{placeholder}` that stands for each in `auth.legal.consent`. */
const DOCUMENTS: Record<string, { href: string; labelKey: TranslationKey }> = {
  guidelines: { href: ROUTES.community, labelKey: 'auth.legal.guidelines' },
  privacy: { href: ROUTES.privacy, labelKey: 'auth.legal.privacy' },
  terms: { href: ROUTES.terms, labelKey: 'auth.legal.terms' },
}

type LegalConsentLabelProps = {
  id: string
}

/** The sentence next to every "I accept" checkbox, with links to the three documents. */
export const LegalConsentLabel = ({ id }: LegalConsentLabelProps) => {
  const { t } = useI18n()
  /** Odd parts are placeholder names: the word order differs between languages. */
  const parts = t('auth.legal.consent').split(/\{(\w+)\}/)

  return (
    <Label
      className="text-[13px] font-normal leading-normal text-foreground"
      htmlFor={id}
    >
      {parts.map((part, index) => {
        const document = index % 2 === 1 ? DOCUMENTS[part] : undefined
        if (!document) return part
        return (
          <Link
            className={LINK_CLASS}
            href={document.href}
            key={part}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t(document.labelKey)}
          </Link>
        )
      })}
    </Label>
  )
}
