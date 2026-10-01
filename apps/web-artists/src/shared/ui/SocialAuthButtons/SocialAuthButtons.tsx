'use client'

import {
  Button,
  Checkbox,
  FacebookArtistIcon,
  GoogleIcon,
  Label,
  Typography,
} from '@bitrate/ui-react'
import { apiBaseUrl } from '@shared/api'
import { ROUTES } from '@shared/routes/routes'
import { useState } from 'react'

const buttonStyles =
  'border bg-black-800 text-white border-neutral-600 relative w-full inline-flex items-center justify-center'

const iconStyles = 'absolute left-4 top-1/2 -translate-y-1/2'

const ICON_SIZE = 24

const CONSENT_ID = 'social-accept-legal'

/** Tells the API the artist accepted the documents; it refuses to create an account otherwise. */
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

/**
 * The social sign-up alternatives. A provider can create an account for a new artist, so the
 * buttons stay locked until the Terms of Use, Privacy Policy and Artist Agreement are accepted.
 */
export const SocialAuthButtons = () => {
  const [accepted, setAccepted] = useState(false)

  return (
    <>
      <div className="flex items-start gap-3 text-sm">
        <Checkbox
          checked={accepted}
          id={CONSENT_ID}
          onCheckedChange={setAccepted}
        />
        <Label className="font-normal leading-snug" htmlFor={CONSENT_ID}>
          I am at least 16 years old and accept the{' '}
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
        </Label>
      </div>
      {PROVIDERS.map(({ label, Icon, href }) => {
        const content = (
          <>
            <span className={iconStyles}>
              <Icon className="block" height={ICON_SIZE} width={ICON_SIZE} />
            </span>
            <span className="w-full text-center">
              <Typography as="p" className="leading-none" size="heading6">
                {label}
              </Typography>
            </span>
          </>
        )

        return accepted ? (
          <Button
            asChild
            className={buttonStyles}
            key={label}
            size="xl"
            variant="artistCard"
          >
            <a href={href}>{content}</a>
          </Button>
        ) : (
          <Button
            aria-label={label}
            className={buttonStyles}
            disabled
            key={label}
            size="xl"
            type="button"
            variant="artistCard"
          >
            {content}
          </Button>
        )
      })}
    </>
  )
}
