import { QueryClientProvider } from '@shared/api/reactQueryClient'
import { SITE_DESCRIPTION, SITE_NAME } from '@shared/constants'
import { AuthProvider } from '@shared/hooks'
import type { Metadata } from 'next'
import { League_Spartan } from 'next/font/google'
import type { ReactNode } from 'react'

import './global.css'

const leagueSpartan = League_Spartan({
  variable: '--font-league-spartan',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    /** PNG, not the SVG: iOS ignores an SVG apple-touch-icon and screenshots the page instead. */
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const lang = 'en'

  return (
    <html data-scroll-behavior="smooth" lang={lang}>
      <body className={`${leagueSpartan.variable} antialiased`}>
        <QueryClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
