import { Typography } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

/**
 * Sits next to the social sign-in buttons. Continuing with a provider creates an account
 * for new users, so the notice names the documents they agree to by doing so.
 */
export const OAuthLegalNotice = () => (
  <Typography as="p" className="text-center text-xs text-grey-500" size="body">
    By continuing with a social account you confirm you are at least 16 and
    accept the{' '}
    <Link className="text-primary hover:opacity-70" href={ROUTES.terms}>
      Terms of Use
    </Link>{' '}
    and{' '}
    <Link className="text-primary hover:opacity-70" href={ROUTES.privacy}>
      Privacy Policy
    </Link>
    .
  </Typography>
)
