import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'
import { parseWebEnv } from './env.schema'

const environment = parseWebEnv({
  enforceDeployment: Boolean(process.env.ENFORCE_DEPLOY_ENV),
  environment: process.env,
})
const apiBaseUrl =
  (environment.API_URL ?? environment.NEXT_PUBLIC_API_URL)?.replace(
    /\/$/,
    '',
  ) ?? 'http://localhost:3000'

const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 60,
    },
    /**
     * Next 16.3 removed `experimental.turbopackMemoryLimit`, which this config
     * used to cap Turbopack's in-memory dev cache; there is no replacement knob,
     * so disabling the filesystem cache below is now the only lever here.
     *
     * Turbopack's dev filesystem cache is the source of the runaway memory in
     * this repo: measured live, the dev server climbed from 1.6 GB to 6.5 GB in
     * about two minutes and kept growing while completely idle, and
     * `turbopackMemoryLimit` alone did not bound it (that target only covers
     * Turbopack's own allocator, not the mapped cache).
     *
     * Turning the cache off trades a slower cold start for a dev server that
     * stays flat. Set it back to `true` if you would rather have fast restarts
     * and run `pnpm clean:cache` regularly instead.
     */
    turbopackFileSystemCacheForDev: false,
  },
  pageExtensions: ['ts', 'tsx', 'mdx'],
  poweredByHeader: false,
  transpilePackages: ['@bitrate/ui-react'],
  async rewrites() {
    return [
      {
        source: '/api-media/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ]
  },
  // For debug
  // swcMinify: false,
  // reactStrictMode: false,
  // webpack(webpackConfig) {
  //   return {
  //     ...webpackConfig,
  //     optimization: {
  //       minimize: false,
  //     }
  //   }
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
      },
    ],
  },
} satisfies NextConfig

export default withSentryConfig(nextConfig, {
  org: 'bitrate-1l',
  project: 'player',
  /** Build-time secret, unlike the DSN. Absent, the build just skips the upload. */
  authToken: process.env.SENTRY_AUTH_TOKEN,
  /** Upload a wider set of client files so browser stack traces resolve. */
  widenClientFileUpload: true,
  /**
   * Route the browser's events through this app's own origin so ad-blockers do
   * not drop them. It must stay a fixed string and stay excluded from the route
   * guard's matcher in `src/proxy.ts` — a redirect on this path silently kills
   * client-side reporting.
   */
  tunnelRoute: '/monitoring',
  silent: !process.env.CI,
})
