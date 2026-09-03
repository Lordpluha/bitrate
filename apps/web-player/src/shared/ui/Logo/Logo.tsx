import { cn, SpotifyLogo } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

export type LogoProps = {
  color?: 'dark' | 'light'
  href?: string
}

export const Logo = ({ color = 'dark', href = ROUTES.landing }: LogoProps) => {
  return (
    <Link
      aria-label="Spotify Home"
      className="transition-[0.3s] hover:opacity-70"
      href={href}
    >
      <SpotifyLogo
        className={cn(
          'transition-[0.3s]',
          color === 'dark'
            ? 'text-text fill-text'
            : 'text-text-contrast fill-text-contrast',
        )}
        height={32}
        width={112}
      />
    </Link>
  )
}
