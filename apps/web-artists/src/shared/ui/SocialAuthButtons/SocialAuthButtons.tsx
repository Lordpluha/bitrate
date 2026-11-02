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
import { Interpolate, type TranslationKey, useI18n } from '@shared/i18n'
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
  label: TranslationKey
  Icon: typeof GoogleIcon
  href: string
}

const PROVIDERS: SocialProvider[] = [
  {
    label: 'auth.social.google',
    Icon: GoogleIcon,
    href: `${apiBaseUrl}/api/v1/artists/auth/oauth/google${ACCEPTANCE_QUERY}`,
  },
  {
    label: 'auth.social.facebook',
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
  const { t } = useI18n()
  const legalLink = (href: string, label: string) => (
    <a
      className="text-primary hover:opacity-70"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  )

  return (
    <>
      <div className="flex items-start gap-3 text-sm">
        <Checkbox
          checked={accepted}
          id={CONSENT_ID}
          onCheckedChange={setAccepted}
        />
        <Label className="font-normal leading-snug" htmlFor={CONSENT_ID}>
          <Interpolate
            message={t('auth.social.consent')}
            values={{
              terms: legalLink(ROUTES.terms, t('auth.legal.terms')),
              community: legalLink(ROUTES.community, t('auth.legal.community')),
              artistAgreement: legalLink(
                ROUTES.artistAgreement,
                t('auth.legal.artistAgreement'),
              ),
              privacy: legalLink(ROUTES.privacy, t('auth.legal.privacy')),
            }}
          />
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
                {t(label)}
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
            aria-label={t(label)}
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
