import type { NextConfig } from 'next'

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  poweredByHeader: false,
  transpilePackages: ['@spotify/ui-react'],
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
