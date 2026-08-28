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

/**
 * Target memory ceiling for Turbopack, in bytes.
 *
 * Turbopack keeps its dev cache in memory and, without a target, grows until the
 * machine runs out — this repo saw the dev server sit at 1.5–2.3 GB with a JS
 * heap of only ~160 MB, i.e. the weight was Turbopack's cache, not app code.
 * With a target it evicts instead of accumulating. Raise it if HMR gets slow.
 */
const TURBOPACK_MEMORY_LIMIT = 1_536 * 1024 * 1024

const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 60,
    },
    turbopackMemoryLimit: TURBOPACK_MEMORY_LIMIT,
    /**
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
  transpilePackages: ['@spotify/ui-react'],
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

export default nextConfig
