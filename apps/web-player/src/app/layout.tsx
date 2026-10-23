import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from '@shared/constants/site'
import { brandFontVariables } from '@shared/fonts'
import { ThemeScript } from '@shared/utils'
import type { Metadata, Viewport } from 'next'
import { Kanit } from 'next/font/google'
import type { PropsWithChildren } from 'react'
import { Provider } from './_provider'

import './global.css'

const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    /** PNG, not the SVG: iOS ignores an SVG apple-touch-icon and screenshots the page instead. */
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        /** Bump `v` when the image changes: Telegram and other scrapers cache previews by URL. */
        url: '/opengraph-image.png?v=2',
        width: 1536,
        height: 1024,
        alt: SITE_NAME,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/twitter-image.png?v=2'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: PropsWithChildren) {
  const lang = 'en'

  return (
    <html
      data-scroll-behavior="smooth"
      lang={lang}
      suppressHydrationWarning={true}
    >
      <head>
        <ThemeScript />
      </head>
      <body className={`${brandFontVariables} ${kanit.variable}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
