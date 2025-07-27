import type { NextConfig } from "next";
import withSvgr from 'next-plugin-svgr';

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
} satisfies NextConfig;

export default withSvgr(nextConfig);