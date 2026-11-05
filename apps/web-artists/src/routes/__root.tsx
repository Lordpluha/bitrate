import { QueryClientProvider } from '@shared/api/reactQueryClient'
import { SITE_DESCRIPTION, SITE_NAME } from '@shared/constants'
import { AuthProvider } from '@shared/hooks'
import { getRequestLocale, I18nProvider } from '@shared/i18n'
import { WorkspaceThemeProvider } from '@shared/theme/WorkspaceThemeProvider'
import { WorkspaceThemeScript } from '@shared/theme/WorkspaceThemeScript'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import appCss from '../global.css?url'

export const Route = createRootRoute({
  // A loader, not beforeLoad: its result is dehydrated, so hydration reuses the server's locale.
  loader: () => ({ locale: getRequestLocale() }),
  // The provider owns the locale after the first render; the picker updates it in place.
  shouldReload: false,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_NAME },
      { name: 'description', content: SITE_DESCRIPTION },
      { name: 'application-name', content: SITE_NAME },
      { property: 'og:title', content: SITE_NAME },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:image', content: '/opengraph-image.png' },
      { property: 'og:image:alt', content: 'Bitrate' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_NAME },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: '/twitter-image.png' },
      { name: 'twitter:image:alt', content: 'Bitrate' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
      /** PNG, not the SVG: iOS ignores an SVG apple-touch-icon and screenshots the page instead. */
      { rel: 'apple-touch-icon', href: '/apple-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400&family=Poppins:wght@400;500;600&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { locale } = Route.useLoaderData()
  return (
    <html
      className="dark"
      data-scroll-behavior="smooth"
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <WorkspaceThemeScript />
        <HeadContent />
      </head>
      <body className="antialiased">
        <I18nProvider initialLocale={locale}>
          <QueryClientProvider>
            <AuthProvider>
              <WorkspaceThemeProvider>{children}</WorkspaceThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  )
}
