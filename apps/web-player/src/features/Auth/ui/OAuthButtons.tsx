'use client'

import { Button, cn } from '@bitrate/ui-react'
import { getOAuthUrl } from '@features/Auth/api/oauth'
import {
  type SocialProvider,
  socialProviders,
} from '@features/Auth/model/oauthProviders'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useId, useState } from 'react'
import { SocialLegalConsent } from './SocialLegalConsent'

/** Shown up front; the rest of the providers wait behind "More options". */
const [GOOGLE, ...REST] = socialProviders
const FEATURED = REST.slice(0, 2)
const MORE = REST.slice(2)
const LIVE_LABELS = socialProviders
  .filter((provider) => provider.activeProvider)
  .map((provider) => provider.label)

const SoonBadge = () => (
  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
    Soon
  </span>
)

type ProviderTileProps = {
  isUnlocked: boolean
  provider: SocialProvider
}

/** A compact provider: a link once usable, otherwise its name (and "Soon" when not built yet). */
const ProviderTile = ({ isUnlocked, provider }: ProviderTileProps) => {
  const tileClass =
    'flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-semibold text-foreground'

  if (!provider.activeProvider) {
    return (
      <span className={tileClass}>
        <span className="truncate">{provider.label}</span>
        <SoonBadge />
        <span className="sr-only">: sign in is not available yet</span>
      </span>
    )
  }

  if (!isUnlocked) {
    return (
      <button
        aria-label={`Continue with ${provider.label}`}
        className={cn(tileClass, 'cursor-not-allowed opacity-60')}
        disabled
        type="button"
      >
        {provider.label}
      </button>
    )
  }

  return (
    <a
      aria-label={`Continue with ${provider.label}`}
      className={cn(tileClass, 'transition-colors hover:bg-muted')}
      href={getOAuthUrl(provider.activeProvider, { acceptLegal: true })}
    >
      {provider.label}
    </a>
  )
}

type OAuthButtonsProps = {
  /**
   * Whether the surrounding form's own "I accept" checkbox is ticked. Leave it out where there
   * is no such checkbox (sign-in): the buttons then bring one of their own.
   */
  accepted?: boolean
}

/**
 * Social sign-in. A provider can create an account for a new user, so the providers stay
 * locked until the Terms of Use, Community Guidelines and Privacy Policy are accepted.
 */
export const OAuthButtons = ({ accepted }: OAuthButtonsProps) => {
  const [ownAccepted, setOwnAccepted] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreId = useId()
  const hasOwnCheckbox = accepted === undefined
  const isUnlocked = accepted ?? ownAccepted
  const googleUrl =
    GOOGLE?.activeProvider &&
    getOAuthUrl(GOOGLE.activeProvider, { acceptLegal: true })

  return (
    <div className="flex flex-col gap-2.5">
      {hasOwnCheckbox ? (
        <SocialLegalConsent
          checked={ownAccepted}
          id="social-accept-legal"
          onCheckedChange={setOwnAccepted}
        />
      ) : null}

      {GOOGLE ? (
        isUnlocked && googleUrl ? (
          <Button asChild className="w-full font-medium" variant="outline">
            <a href={googleUrl}>Continue with {GOOGLE.label}</a>
          </Button>
        ) : (
          <Button
            className="w-full font-medium"
            disabled
            type="button"
            variant="outline"
          >
            Continue with {GOOGLE.label}
          </Button>
        )
      ) : null}

      <div className="flex gap-2">
        {FEATURED.map((provider) => (
          <ProviderTile
            isUnlocked={isUnlocked}
            key={provider.id}
            provider={provider}
          />
        ))}
      </div>

      {isMoreOpen ? (
        <section
          aria-labelledby={`${moreId}-title`}
          className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-6"
          id={moreId}
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              className="text-sm font-semibold text-foreground"
              id={`${moreId}-title`}
            >
              More sign-in options
            </h2>
            <Button
              aria-controls={moreId}
              aria-expanded
              aria-label="Hide more sign-in options"
              className="size-9 rounded-lg p-0"
              onClick={() => setIsMoreOpen(false)}
              type="button"
              variant="ghost"
            >
              <ChevronUp aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MORE.map((provider) => (
              <ProviderTile
                isUnlocked={isUnlocked}
                key={provider.id}
                provider={provider}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Coming soon — {LIVE_LABELS.join(' and ')} are live today.
          </p>
        </section>
      ) : (
        <Button
          aria-expanded={false}
          className="w-full gap-1.5 font-medium"
          onClick={() => setIsMoreOpen(true)}
          type="button"
          variant="ghost"
        >
          <ChevronDown aria-hidden="true" className="size-4" />
          More options · {MORE.length}
        </Button>
      )}
    </div>
  )
}
