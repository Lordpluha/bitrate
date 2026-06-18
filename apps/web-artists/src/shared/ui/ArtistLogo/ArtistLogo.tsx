import { ArtistlogoIcon, cn } from '@spotify/ui-react'
import Link from 'next/link'

export const ArtistLogo = () => {
  return (
    <Link aria-label="for Artists" href={'/'}>
      <ArtistlogoIcon
        className={cn('text-text fill-text')}
        height={36}
        width={147}
      />
    </Link>
  )
}
