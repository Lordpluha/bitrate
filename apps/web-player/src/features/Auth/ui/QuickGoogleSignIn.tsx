'use client'

import { Button, cn } from '@bitrate/ui-react'
import { getOAuthUrl } from '@features/Auth/api/oauth'
import { useI18n } from '@shared/i18n'
import { useState } from 'react'
import { AUTH_BUTTON_CLASS } from './authStyles'
import { SocialLegalConsent } from './SocialLegalConsent'

type QuickGoogleSignInProps = {
  className?: string
  /** Funnel placement for the Google link (see `trackFunnel`), when the host counts clicks. */
  funnel?: string
}

/**
 * One-step sign-up or sign-in with Google, for pages outside the auth screens (the landing):
 * just the consent box and the Google button. Google can create an account for a new visitor,
 * so the button stays locked until the Terms, Community Guidelines and Privacy Policy are
 * accepted, exactly as in the auth screens' full provider list.
 */
export const QuickGoogleSignIn = ({
  className,
  funnel,
}: QuickGoogleSignInProps) => {
  const { t } = useI18n()
  const [accepted, setAccepted] = useState(false)
  const label = t('auth.oauth.continueWith', { provider: 'Google' })

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {accepted ? (
        <Button
          asChild
          className={cn(AUTH_BUTTON_CLASS, 'px-4')}
          variant="outline"
        >
          <a
            data-funnel={funnel}
            href={getOAuthUrl('google', { acceptLegal: true })}
          >
            {label}
          </a>
        </Button>
      ) : (
        <Button
          className={cn(AUTH_BUTTON_CLASS, 'px-4 disabled:opacity-100')}
          disabled
          type="button"
          variant="outline"
        >
          {label}
        </Button>
      )}
      <SocialLegalConsent
        checked={accepted}
        id="quick-google-accept-legal"
        onCheckedChange={setAccepted}
      />
    </div>
  )
}
