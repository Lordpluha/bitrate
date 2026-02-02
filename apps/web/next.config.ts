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
  async redirects() {
    return [
      {
        source: '/artists',
        destination: 'http://artists.localhost:3002/',
        permanent: false,
      },
      {
        source: '/artists/:path+',
        destination: 'http://artists.localhost:3002/:path+',
        permanent: false,
      },
    ];
  }
} satisfies NextConfig

export default nextConfig
