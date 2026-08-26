import { getSiteUrl } from '@shared/constants/site'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

  /** Only the canonical, indexable landing page belongs in the sitemap. */
  return [{ url: siteUrl, lastModified, priority: 1 }]
}
