import { FC } from 'react'

import Link from 'next/link'

import { theme } from '@shared/constants'
import { ROUTES } from '@shared/routes'


export type LogoProps = {
  color?: theme
}

export const Logo: FC<LogoProps> = ({ color = 'dark' }) => {
  return (
    <Link
      href={ROUTES.landing}
      aria-label='Spotify Home'
      className='transition-[0.3s] hover:opacity-70'
    >
      {/* <SpotifyLogo
        className={clsx(
          'transition-[0.3s]',
          color === 'dark'
            ? 'text-text fill-text'
            : 'text-textContrast fill-textContrast'
        )}
      /> */}
    </Link>
  )
}
