import { Label } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

type LegalConsentLabelProps = {
  id: string
}

/** The sentence next to every "I accept" checkbox, with links to the two documents. */
export const LegalConsentLabel = ({ id }: LegalConsentLabelProps) => (
  <Label className="font-normal leading-snug" htmlFor={id}>
    I am at least 16 years old and accept the{' '}
    <Link className="text-primary hover:opacity-70" href={ROUTES.terms}>
      Terms of Use
    </Link>{' '}
    and{' '}
    <Link className="text-primary hover:opacity-70" href={ROUTES.privacy}>
      Privacy Policy
    </Link>
    .
  </Label>
)
