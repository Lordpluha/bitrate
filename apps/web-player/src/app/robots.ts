import { getSiteUrl } from '@shared/constants/site'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /** Signed-in surfaces hold personal data and never render for a crawler. */
      disallow: ['/main/', '/auth/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  }
}
