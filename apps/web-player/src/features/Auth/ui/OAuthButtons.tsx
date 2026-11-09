'use client'

import { Button, cn } from '@bitrate/ui-react'
import { getOAuthUrl } from '@features/Auth/api/oauth'
import {
  type SocialProvider,
  socialProviders,
} from '@features/Auth/model/oauthProviders'
import { useI18n } from '@shared/i18n'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useId, useState } from 'react'
import { AUTH_BUTTON_CLASS } from './authStyles'
import { SocialLegalConsent } from './SocialLegalConsent'

/** Shown up front; the rest of the providers wait behind "More options". */
const [GOOGLE, ...REST] = socialProviders
const FEATURED = REST.slice(0, 2)
const MORE = REST.slice(2)
const LIVE_LABELS = socialProviders
  .filter((provider) => provider.activeProvider)
  .map((provider) => provider.label)

const SoonBadge = () => {
  const { t } = useI18n()

  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs leading-4 font-semibold text-secondary-foreground">
      {t('auth.oauth.soon')}
    </span>
  )
}

type ProviderTileProps = {
  isUnlocked: boolean
  provider: SocialProvider
}

/** A compact provider: a link once usable, otherwise its name (and "Soon" when not built yet). */
const ProviderTile = ({ isUnlocked, provider }: ProviderTileProps) => {
  const { t } = useI18n()
  const continueLabel = t('auth.oauth.continueWith', {
    provider: provider.label,
  })
  const tileClass =
    'flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border text-xs leading-[1.25] font-semibold text-foreground'

  if (!provider.activeProvider) {
    return (
      <span className={tileClass}>
        <span className="truncate">{provider.label}</span>
        <SoonBadge />
        <span className="sr-only">: {t('auth.oauth.notAvailable')}</span>
      </span>
    )
  }

  if (!isUnlocked) {
    return (
      <button
        aria-label={continueLabel}
        className={cn(tileClass, 'cursor-not-allowed')}
        disabled
        type="button"
      >
        {provider.label}
      </button>
    )
  }

  return (
    <a
      aria-label={continueLabel}
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
  const { locale, t } = useI18n()
  const [ownAccepted, setOwnAccepted] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreId = useId()
  const hasOwnCheckbox = accepted === undefined
  const isUnlocked = accepted ?? ownAccepted
  const googleLabel = GOOGLE
    ? t('auth.oauth.continueWith', { provider: GOOGLE.label })
    : ''
  const liveProviders = new Intl.ListFormat(locale, {
    type: 'conjunction',
  }).format(LIVE_LABELS)
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
          <Button
            asChild
            className={cn(AUTH_BUTTON_CLASS, 'px-4')}
            variant="outline"
          >
            <a href={googleUrl}>{googleLabel}</a>
          </Button>
        ) : (
          <Button
            className={cn(AUTH_BUTTON_CLASS, 'px-4 disabled:opacity-100')}
            disabled
            type="button"
            variant="outline"
          >
            {googleLabel}
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
          className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-[23px]"
          id={moreId}
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              className="text-sm leading-[1.2] font-semibold text-foreground"
              id={`${moreId}-title`}
            >
              {t('auth.oauth.moreTitle')}
            </h2>
            <Button
              aria-controls={moreId}
              aria-expanded
              aria-label={t('auth.oauth.hideMore')}
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
          <p className="text-xs leading-[1.25] text-muted-foreground">
            {t('auth.oauth.comingSoon', { providers: liveProviders })}
          </p>
        </section>
      ) : (
        <Button
          aria-expanded={false}
          className={cn(AUTH_BUTTON_CLASS, 'gap-1.5 px-4')}
          onClick={() => setIsMoreOpen(true)}
          type="button"
          variant="ghost"
        >
          <ChevronDown aria-hidden="true" className="size-4" />
          {t('auth.oauth.more', { count: MORE.length })}
        </Button>
      )}
    </div>
  )
}
