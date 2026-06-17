import type { Plugin } from 'vite'

export interface SvgrPluginOptions {
  /** SVG source directory. Supports @scope/pkg/subpath, relative, and absolute paths. */
  input: string
  /** Output directory for generated React components. */
  output: string
  /** Color variable names for multicolor icons (e.g. ["primaryColor", "secondaryColor"]). */
  variables?: string[]
}

export declare function svgrPlugin(options: SvgrPluginOptions): Plugin
