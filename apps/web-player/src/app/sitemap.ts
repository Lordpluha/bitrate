import { getSiteUrl } from '@shared/constants/site'
import { ROUTES } from '@shared/routes'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

  /** Only publicly reachable routes — everything under /main requires a session. */
  return [
    { url: `${siteUrl}${ROUTES.landing}`, lastModified, priority: 1 },
    { url: `${siteUrl}${ROUTES.auth.login}`, lastModified, priority: 0.5 },
    {
      url: `${siteUrl}${ROUTES.auth.registration}`,
      lastModified,
      priority: 0.5,
    },
  ]
}
