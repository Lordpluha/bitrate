import type { ActiveOAuthProvider } from '@features/Auth/api/oauth'
import {
  AppleIcon,
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
} from '@spotify/ui-react'
import type { ComponentType, SVGProps } from 'react'

export type SocialProvider = {
  activeProvider?: ActiveOAuthProvider
  brandColor: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  id: string
  label: string
  textColor: string
}

const socialProvider = (
  id: string,
  label: string,
  brandColor: string,
  textColor: string,
  icon: SocialProvider['icon'],
  activeProvider?: ActiveOAuthProvider,
): SocialProvider => ({
  activeProvider,
  brandColor,
  icon,
  id,
  label,
  textColor,
})

export const socialProviders: SocialProvider[] = [
  socialProvider(
    'google',
    'Google',
    'var(--color-brand-google)',
    'var(--color-brand-google-foreground)',
    GoogleIcon,
    'google',
  ),
  socialProvider(
    'facebook',
    'Facebook',
    'var(--color-brand-facebook)',
    'var(--color-brand-facebook-foreground)',
    FacebookIcon,
    'facebook',
  ),
  socialProvider(
    'apple',
    'Apple',
    'var(--color-brand-apple)',
    'var(--color-brand-apple-foreground)',
    AppleIcon,
  ),
  socialProvider(
    'discord',
    'Discord',
    'var(--color-brand-discord)',
    'var(--color-brand-discord-foreground)',
    DiscordIcon,
  ),
  socialProvider(
    'github',
    'GitHub',
    'var(--color-brand-github)',
    'var(--color-brand-github-foreground)',
    GithubIcon,
  ),
  socialProvider(
    'microsoft',
    'Microsoft',
    'var(--color-brand-microsoft)',
    'var(--color-brand-microsoft-foreground)',
    MicrosoftIcon,
  ),
  socialProvider(
    'x',
    'X',
    'var(--color-brand-x)',
    'var(--color-brand-x-foreground)',
    TwitterIcon,
  ),
  socialProvider(
    'instagram',
    'Instagram',
    'var(--color-brand-instagram)',
    'var(--color-brand-instagram-foreground)',
    InstagramIcon,
  ),
  socialProvider(
    'tiktok',
    'TikTok',
    'var(--color-brand-tiktok)',
    'var(--color-brand-tiktok-foreground)',
    TiktokIcon,
  ),
  socialProvider(
    'twitch',
    'Twitch',
    'var(--color-brand-twitch)',
    'var(--color-brand-twitch-foreground)',
    TwitchIcon,
  ),
  socialProvider(
    'linkedin',
    'LinkedIn',
    'var(--color-brand-linkedin)',
    'var(--color-brand-linkedin-foreground)',
    LinkedinIcon,
  ),
  socialProvider(
    'reddit',
    'Reddit',
    'var(--color-brand-reddit)',
    'var(--color-brand-reddit-foreground)',
    RedditIcon,
  ),
  socialProvider(
    'telegram',
    'Telegram',
    'var(--color-brand-telegram)',
    'var(--color-brand-telegram-foreground)',
    TelegramIcon,
  ),
]
