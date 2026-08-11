'use client'

import { getOAuthUrl } from '@features/Auth/api/oauth'
import {
  type SocialProvider,
  socialProviders,
} from '@features/Auth/model/oauthProviders'
import { Button, Typography } from '@spotify/ui-react'

const SocialIcon = ({ provider }: { provider: SocialProvider }) => {
  const Icon = provider.icon

  return <Icon className="size-7 shrink-0" />
}

export const OAuthButtons = () => (
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
            href={getOAuthUrl(provider.activeProvider)}
          >
            {content}
          </a>
        </Button>
      )
    })}
  </div>
)
