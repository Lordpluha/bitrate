import { ROUTES } from '@shared/routes'
import { cn, SpotifyLogo } from '@spotify/ui-react'
import Link from 'next/link'
import type { FC } from 'react'

export type LogoProps = {
  color?: 'dark' | 'light'
}

export const Logo: FC<LogoProps> = ({ color = 'dark' }) => {
  return (
    <Link
      aria-label="Spotify Home"
      className="transition-[0.3s] hover:opacity-70"
      href={ROUTES.landing}
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
