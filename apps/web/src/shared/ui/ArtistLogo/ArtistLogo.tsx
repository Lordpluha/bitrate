import { ROUTES } from '@shared/routes'
import { ArtistlogoIcon, cn } from '@spotify/ui-react'
import Link from 'next/link'

export const ArtistLogo = () => {
  return (
    <Link
      aria-label="for Artists"
      href={ROUTES.landing}
    >
      <ArtistlogoIcon
        width={146}
        height={36}
        className={cn('text-text fill-text')}
      />
    </Link>
  )
}
