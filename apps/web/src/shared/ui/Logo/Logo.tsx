import type { Theme } from '@shared/constants';
import { ROUTES } from '@shared/routes';
import Link from 'next/link';
import type { FC } from 'react';

export type LogoProps = {
  color?: Theme;
};

export const Logo: FC<LogoProps> = ({ color = 'dark' }) => {
  return (
    <Link
      aria-label="Spotify Home"
      className="transition-[0.3s] hover:opacity-70"
      href={ROUTES.landing}
    >
      {/* <SpotifyLogo
        className={cn(
          'transition-[0.3s]',
          color === 'dark'
            ? 'text-text fill-text'
            : 'text-textContrast fill-textContrast'
        )}
      /> */}
    </Link>
  );
};
