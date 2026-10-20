import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'

import adrIndexPlugin from './src/plugins/adrIndex'
import { bitrateTheme } from './src/prism/bitrateTheme'

/** Must match DIM_STORAGE_KEY in src/theme/Navbar/ColorModeToggle. */
const DIM_STORAGE_KEY = 'bitrate-docs-dim'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Bitrate Documentation',
  tagline: 'Open source music streaming platform built with modern web technologies',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  clientModules: ['./src/fonts.ts'],
  plugins: [adrIndexPlugin],
  /** Restores the dim variant before first paint, so a dim reader never sees a dark flash. */
  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `try{if(localStorage.getItem('${DIM_STORAGE_KEY}')==='1')document.documentElement.dataset.themeVariant='dim'}catch(e){}`,
    },
  ],
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      /**
       * Search runs entirely in the browser against an index built at compile time, so it
       * ships inside the docs image and adds no third-party processor — see the law
       * roadmap, which requires a DPA for every service user data reaches. Algolia
       * DocSearch would have meant an application, an API key, and every query leaving
       * the site.
       *
       * `ru` is listed alongside `en` because part of the guides is written in Russian;
       * without its stemmer those pages index by exact word form only.
       */
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: false,
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
        language: ['en', 'ru'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchResultLimits: 10,
        searchResultContextMaxLength: 60,
      },
    ],
  ],
  // In order for Mermaid code blocks in Markdown to work,
  // you also need to enable the Remark plugin with this option
  markdown: {
    mermaid: true,
  },

  url: 'https://docs.bitrate.me',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lordpluha', // Usually your GitHub org/user name.
  projectName: 'bitrate', // Usually your repo name.

  onBrokenLinks: 'throw',
  /** Anchors only warn by default, so a renamed heading silently breaks every link to it. */
  onBrokenAnchors: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Lordpluha/bitrate/tree/develop/apps/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/Lordpluha/bitrate/tree/develop/apps/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/bitrate-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
      options: { fontFamily: 'Inter Variable, system-ui, sans-serif' },
    },
    navbar: {
      title: 'Bitrate Docs',
      logo: {
        alt: 'Bitrate',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        /** Placed first on the right so the search box leads the right-hand group. */
        { type: 'search', position: 'right' },
        {
          href: 'https://github.com/lordpluha/bitrate',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/introduction',
            },
            {
              label: 'API Reference',
              to: '/docs/applications/api/overview',
            },
            {
              label: 'Contributing',
              to: '/docs/guides/contributing',
            },
          ],
        },
        {
          title: 'Applications',
          items: [
            {
              label: 'Web Player',
              to: '/docs/applications/web-player/overview',
            },
            {
              label: 'Mobile App',
              to: '/docs/applications/mobile/overview',
            },
            {
              label: 'Desktop App',
              to: '/docs/applications/desktop/overview',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/lordpluha/bitrate',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lordpluha. Built with Docusaurus.`,
    },
    prism: {
      theme: bitrateTheme,
      darkTheme: bitrateTheme,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
