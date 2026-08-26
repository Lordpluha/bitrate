const DEFAULT_SITE_URL = 'http://localhost:3001'

export const resolveSiteUrl = (
  configuredSiteUrl: string | undefined,
  nodeEnv: string | undefined,
) => {
  if (!configuredSiteUrl) {
    if (nodeEnv === 'production') {
      throw new Error('NEXT_PUBLIC_SITE_URL is required in production')
    }

    return DEFAULT_SITE_URL
  }

  const siteUrl = new URL(configuredSiteUrl)
  if (nodeEnv === 'production' && siteUrl.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS in production')
  }

  if (
    nodeEnv === 'production' &&
    (siteUrl.hostname === 'localhost' || siteUrl.hostname === '127.0.0.1')
  ) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL cannot point to localhost in production',
    )
  }

  if (siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL must be an origin without a path or query',
    )
  }

  return siteUrl.origin
}

/**
 * Which rule set `getSiteUrl` applies.
 *
 * `next build` runs with `NODE_ENV=production` even for a local smoke build or
 * an E2E run, so production mode alone cannot mean "this artifact is being
 * published". The Dockerfile that builds the deployable image sets
 * `ENFORCE_DEPLOY_ENV` alongside the real origin, and that is what turns the
 * deployment rules on.
 */
const siteUrlRuleSet = () =>
  process.env.ENFORCE_DEPLOY_ENV ? process.env.NODE_ENV : 'development'

/** Public origin of the web player, used for canonical URLs and the sitemap. */
export const getSiteUrl = () =>
  resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, siteUrlRuleSet())

export const SITE_NAME = 'Spotify clone'

export const SITE_DESCRIPTION =
  'Listen to music, build playlists and follow artists.'
