import type { NextConfig } from 'next'

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  poweredByHeader: false,
  transpilePackages: ['@spotify/ui'],
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
} satisfies NextConfig

export default nextConfig
