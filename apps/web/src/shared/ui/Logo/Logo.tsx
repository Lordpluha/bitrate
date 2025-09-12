import { FC, SVGProps } from 'react'

import Link, { LinkProps } from 'next/link'

import { theme } from '@shared/constants'
import { ROUTES } from '@shared/routes'
import clsx from 'clsx'

import { SpotifyLogo } from '../icons'

export interface LogoProps extends SVGProps<HTMLOrSVGElement> {
  color?: theme
  linkProps?: LinkProps
}

export const Logo: FC<LogoProps> = ({ color = 'dark', linkProps, ...svgProps }) => {
  const { className: svgClassName, ...etcSvgProps } = svgProps

  return (
    <Link
      href={ROUTES.landing}
      aria-label='Spotify Home'
      className={'transition-[0.3s] hover:opacity-70'}
      {...linkProps}
    >
      <SpotifyLogo
        className={clsx(
          'transition-[0.3s]',
          color === 'dark'
            ? 'text-text fill-text'
            : 'text-textContrast fill-textContrast',
          svgClassName
        )}
        {...etcSvgProps}
      />
    </Link>
  )
}
