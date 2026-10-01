'use client'

import { Button, Typography } from '@bitrate/ui-react'
import { getOAuthUrl } from '@features/Auth/api/oauth'
import {
  type SocialProvider,
  socialProviders,
} from '@features/Auth/model/oauthProviders'
import { useState } from 'react'
import { SocialLegalConsent } from './SocialLegalConsent'

const SocialIcon = ({ provider }: { provider: SocialProvider }) => {
  const Icon = provider.icon

  return <Icon className="size-7 shrink-0" />
}

type OAuthButtonsProps = {
  /**
   * Whether the surrounding form's own "I accept" checkbox is ticked. Leave it out where there
   * is no such checkbox (sign-in): the buttons then bring one of their own.
   */
  accepted?: boolean
}

/**
 * Social sign-in buttons. A provider can create an account for a new user, so they stay
 * locked until the Terms of Use and Privacy Policy are accepted.
 */
export const OAuthButtons = ({ accepted }: OAuthButtonsProps) => {
  const [ownAccepted, setOwnAccepted] = useState(false)
  const hasOwnCheckbox = accepted === undefined
  const isUnlocked = accepted ?? ownAccepted

  return (
    <div className="flex flex-col gap-3">
      {hasOwnCheckbox ? (
        <SocialLegalConsent
          checked={ownAccepted}
          id="social-accept-legal"
          onCheckedChange={setOwnAccepted}
        />
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {socialProviders.map((provider) => {
          const isActive = Boolean(provider.activeProvider)
          const style = {
            backgroundColor: provider.brandColor,
            borderColor:
              provider.id === 'google' || provider.id === 'microsoft'
                ? 'var(--color-text-subdued)'
                : provider.brandColor,
            color: provider.textColor,
          }

          const content = (
            <>
              <SocialIcon provider={provider} />
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <Typography as="span" className="truncate" size="body">
                  Continue with {provider.label}
                </Typography>
                {!isActive && (
                  <span className="shrink-0 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-current">
                    Soon
                  </span>
                )}
              </span>
            </>
          )

          if (!provider.activeProvider) {
            return (
              <Button
                aria-label={`${provider.label} sign in is not available yet`}
                className="h-11 justify-start gap-3 rounded-md border px-4 disabled:opacity-100"
                disabled
                key={provider.id}
                style={style}
                type="button"
                variant="contrast"
              >
                {content}
              </Button>
            )
          }

          if (!isUnlocked) {
            return (
              <Button
                aria-label={`Continue with ${provider.label}`}
                className="h-11 justify-start gap-3 rounded-md border px-4 disabled:opacity-60"
                disabled
                key={provider.id}
                style={style}
                type="button"
                variant="contrast"
              >
                {content}
              </Button>
            )
          }

          return (
            <Button
              asChild
              className="h-11 justify-start gap-3 rounded-md border px-4"
              key={provider.id}
              style={style}
              variant="contrast"
            >
              <a
                aria-label={`Continue with ${provider.label}`}
                href={getOAuthUrl(provider.activeProvider, {
                  acceptLegal: true,
                })}
              >
                {content}
              </a>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
