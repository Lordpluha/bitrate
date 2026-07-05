import type { NextConfig } from 'next'

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

const nextConfig = {
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
