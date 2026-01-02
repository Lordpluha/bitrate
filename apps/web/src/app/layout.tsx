import { ThemeScript } from '@shared/utils';

import '@spotify/ui/globals.css';
import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import type { PropsWithChildren } from 'react';

import { Provider } from './_provider';
import './global.css';

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'Spotify clone',
  description: 'Spotify clone',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Spotify clone',
    title: 'Spotify clone',
    description: 'Spotify clone',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1187,
        height: 636,
        alt: 'Spotify clone',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spotify clone',
    description: 'Spotify clone',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  const lang = 'en';

  return (
    <html
      data-scroll-behavior="smooth"
      lang={lang}
      suppressHydrationWarning={true}
    >
      <head>
        <ThemeScript />
      </head>
      <body className={`${sourceSans.variable}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
