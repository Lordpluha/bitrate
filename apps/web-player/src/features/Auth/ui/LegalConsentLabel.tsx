import { Label } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

type LegalConsentLabelProps = {
  id: string
}

/** The sentence next to every "I accept" checkbox, with links to the three documents. */
export const LegalConsentLabel = ({ id }: LegalConsentLabelProps) => (
  <Label className="font-normal leading-snug" htmlFor={id}>
    I am at least 16 years old, I accept the{' '}
    <Link
      className="text-primary hover:opacity-70"
      href={ROUTES.terms}
      rel="noopener noreferrer"
      target="_blank"
    >
      Terms of Use
    </Link>{' '}
    and{' '}
    <Link
      className="text-primary hover:opacity-70"
      href={ROUTES.community}
      rel="noopener noreferrer"
      target="_blank"
    >
      Community Guidelines
    </Link>
    , and I have read the{' '}
    <Link
      className="text-primary hover:opacity-70"
      href={ROUTES.privacy}
      rel="noopener noreferrer"
      target="_blank"
    >
      Privacy Policy
    </Link>
    .
  </Label>
)
