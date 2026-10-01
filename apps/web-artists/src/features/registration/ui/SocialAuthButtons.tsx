'use client'

import {
  Button,
  FacebookArtistIcon,
  GoogleIcon,
  Typography,
} from '@bitrate/ui-react'
import { apiBaseUrl } from '@shared/api'
import { ROUTES } from '@shared/routes/routes'

const buttonStyles =
  'border bg-black-800 text-white border-neutral-600 relative w-full inline-flex items-center justify-center'

const iconStyles = 'absolute left-4 top-1/2 -translate-y-1/2'

const ICON_SIZE = 24

/**
 * Continuing with a provider creates an account for a new artist, so the notice under the
 * buttons names the documents they agree to and the start URL tells the API they saw it.
 */
const ACCEPTANCE_QUERY = '?acceptLegal=true&acceptArtistAgreement=true'

/** One social provider a visitor can sign up with. */
type SocialProvider = {
  label: string
  Icon: typeof GoogleIcon
  href: string
}

const PROVIDERS: SocialProvider[] = [
  {
    label: 'Continue with Google',
    Icon: GoogleIcon,
    href: `${apiBaseUrl}/api/v1/artists/auth/oauth/google${ACCEPTANCE_QUERY}`,
  },
  {
    label: 'Continue with Facebook',
    Icon: FacebookArtistIcon,
    href: `${apiBaseUrl}/api/v1/artists/auth/oauth/facebook${ACCEPTANCE_QUERY}`,
  },
]

/** The social sign-up alternatives shown under the email field. */
export const SocialAuthButtons = () => (
  <>
    {PROVIDERS.map(({ label, Icon, href }) => (
      <Button
        asChild
        className={buttonStyles}
        key={label}
        size="xl"
        variant="artistCard"
      >
        <a href={href}>
          <span className={iconStyles}>
            <Icon className="block" height={ICON_SIZE} width={ICON_SIZE} />
          </span>
          <span className="w-full text-center">
            <Typography as="p" className="leading-none" size="heading6">
              {label}
            </Typography>
          </span>
        </a>
      </Button>
    ))}
    <Typography
      as="p"
      className="text-center text-sm text-grey-500"
      size="body"
    >
      By continuing with a social account you confirm you are at least 16 and
      accept the{' '}
      <a className="text-primary hover:opacity-70" href={ROUTES.terms}>
        Terms of Use
      </a>
      ,{' '}
      <a className="text-primary hover:opacity-70" href={ROUTES.privacy}>
        Privacy Policy
      </a>{' '}
      and{' '}
      <a
        className="text-primary hover:opacity-70"
        href={ROUTES.artistAgreement}
      >
        Artist Agreement
      </a>
      .
    </Typography>
  </>
)
