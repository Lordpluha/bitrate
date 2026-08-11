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
    '#ffffff',
    '#1f1f1f',
    GoogleIcon,
    'google',
  ),
  socialProvider(
    'facebook',
    'Facebook',
    '#1877f2',
    '#ffffff',
    FacebookIcon,
    'facebook',
  ),
  socialProvider('apple', 'Apple', '#000000', '#ffffff', AppleIcon),
  socialProvider('discord', 'Discord', '#5865f2', '#ffffff', DiscordIcon),
  socialProvider('github', 'GitHub', '#24292f', '#ffffff', GithubIcon),
  socialProvider('microsoft', 'Microsoft', '#ffffff', '#1f1f1f', MicrosoftIcon),
  socialProvider('x', 'X', '#000000', '#ffffff', TwitterIcon),
  socialProvider('instagram', 'Instagram', '#e1306c', '#ffffff', InstagramIcon),
  socialProvider('tiktok', 'TikTok', '#010101', '#ffffff', TiktokIcon),
  socialProvider('twitch', 'Twitch', '#9146ff', '#ffffff', TwitchIcon),
  socialProvider('linkedin', 'LinkedIn', '#0a66c2', '#ffffff', LinkedinIcon),
  socialProvider('reddit', 'Reddit', '#ff4500', '#ffffff', RedditIcon),
  socialProvider('telegram', 'Telegram', '#26a5e4', '#ffffff', TelegramIcon),
]
