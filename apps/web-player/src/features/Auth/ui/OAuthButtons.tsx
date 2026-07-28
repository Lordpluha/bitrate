'use client'

import { type ActiveOAuthProvider, getOAuthUrl } from '@features/Auth/api/oauth'
import {
  AppleIcon,
  Button,
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  GoogleIcon,
  InstagramIcon,
  LinkedinIcon,
  MicrosoftIcon,
  RedditIcon,
  TelegramIcon,
  TiktokIcon,
  TwitchIcon,
  TwitterIcon,
  Typography,
} from '@spotify/ui-react'
import type { SVGProps } from 'react'

type SocialProvider = {
  id: string
  label: string
  brandColor: string
  textColor: string
  activeProvider?: ActiveOAuthProvider
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element
}

const socialProviders: SocialProvider[] = [
  {
    id: 'google',
    label: 'Google',
    brandColor: '#ffffff',
    textColor: '#1f1f1f',
    activeProvider: 'google',
    icon: GoogleIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    brandColor: '#1877f2',
    textColor: '#ffffff',
    activeProvider: 'facebook',
    icon: FacebookIcon,
  },
  {
    id: 'apple',
    label: 'Apple',
    brandColor: '#000000',
    textColor: '#ffffff',
    icon: AppleIcon,
  },
  {
    id: 'discord',
    label: 'Discord',
    brandColor: '#5865f2',
    textColor: '#ffffff',
    icon: DiscordIcon,
  },
  {
    id: 'github',
    label: 'GitHub',
    brandColor: '#24292f',
    textColor: '#ffffff',
    icon: GithubIcon,
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    brandColor: '#ffffff',
    textColor: '#1f1f1f',
    icon: MicrosoftIcon,
  },
  {
    id: 'x',
    label: 'X',
    brandColor: '#000000',
    textColor: '#ffffff',
    icon: TwitterIcon,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    brandColor: '#e1306c',
    textColor: '#ffffff',
    icon: InstagramIcon,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    brandColor: '#010101',
    textColor: '#ffffff',
    icon: TiktokIcon,
  },
  {
    id: 'twitch',
    label: 'Twitch',
    brandColor: '#9146ff',
    textColor: '#ffffff',
    icon: TwitchIcon,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    brandColor: '#0a66c2',
    textColor: '#ffffff',
    icon: LinkedinIcon,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    brandColor: '#ff4500',
    textColor: '#ffffff',
    icon: RedditIcon,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    brandColor: '#26a5e4',
    textColor: '#ffffff',
    icon: TelegramIcon,
  },
]

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
            ? '#a7a7a7'
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
