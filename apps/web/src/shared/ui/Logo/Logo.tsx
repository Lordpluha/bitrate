import Link from 'next/link'
import Image from 'next/image'
import { SpotifyLogoPrimary } from '../icons'

export const Logo = () => {
  return (
    <Link
      href='/'
      aria-label='Spotify Home'
    >
      <SpotifyLogoPrimary className='text-text fill-text' />
    </Link>
  )
}
