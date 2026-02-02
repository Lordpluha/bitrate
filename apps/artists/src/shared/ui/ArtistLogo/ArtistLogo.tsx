import { ArtistlogoIcon, cn } from '@spotify/ui-react'
import Link from 'next/link'

export const ArtistLogo = () => {
  return (
    <Link
      aria-label="for Artists"
      href={'/'}
    >
      <ArtistlogoIcon
        width={147}
        height={36}
        className={cn('text-text fill-text')}
      />
    </Link>
  )
}
