import { Button } from '@bitrate/ui-react'
import { SocialsAuthDivider } from '@shared/ui'
import Link from 'next/link'
import { OAuthButtons } from './OAuthButtons'

type AuthFormFooterProps = {
  alternateHref: string
  alternateLink: string
  alternateText: string
  isSubmitting?: boolean
  /** Pass the form's own "I accept" checkbox state; leave out where the form has none. */
  socialAccepted?: boolean
  submitLabel: string
}

export const AuthFormFooter = ({
  alternateHref,
  alternateLink,
  alternateText,
  isSubmitting = false,
  socialAccepted,
  submitLabel,
}: AuthFormFooterProps) => (
  <div className="mt-4 flex flex-col items-stretch gap-4">
    <Button
      aria-busy={isSubmitting}
      className="rounded"
      disabled={isSubmitting}
      type="submit"
      variant="primary"
    >
      {submitLabel}
    </Button>
    <SocialsAuthDivider />
    <OAuthButtons accepted={socialAccepted} />
    <p className="text-center text-lg">
      {alternateText}{' '}
      <Link className="font-bold" href={alternateHref}>
        {alternateLink}
      </Link>
    </p>
  </div>
)
