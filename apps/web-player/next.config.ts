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
    ],
  },
} satisfies NextConfig

export default nextConfig
