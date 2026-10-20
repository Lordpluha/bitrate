import Link from '@docusaurus/Link'
import { type GlobalDoc, useAllDocsData } from '@docusaurus/plugin-content-docs/client'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { usePluginData } from '@docusaurus/useGlobalData'
import { ADR_INDEX_PLUGIN, type AdrIndex } from '@site/src/plugins/adrIndexData'
import Heading from '@theme/Heading'
import Layout from '@theme/Layout'
import clsx from 'clsx'
import type { ReactNode } from 'react'

import styles from './index.module.css'

type TileSize = 'wide' | 'half' | 'third' | 'quarter'

type Section = {
  /** Top-level folder under docs/, used to count the section's pages. */
  dir: string
  title: string
  description: string
  /** A doc id resolved through the docs plugin, or a fixed route for generated indexes. */
  target: { docId: string } | { to: string }
  size: TileSize
  icon: ReactNode
}

const LATEST_ADR_COUNT = 5

const icon = (path: ReactNode) => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    {path}
  </svg>
)

const SECTIONS: Section[] = [
  {
    dir: 'applications',
    title: 'Applications',
    description: 'API, web player, artists portal, admin, mobile and desktop.',
    target: { to: '/docs/category/applications' },
    size: 'third',
    icon: icon(
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>,
    ),
  },
  {
    dir: 'packages',
    title: 'Packages',
    description: 'Contracts, converter, ui-react and the CLI tools.',
    target: { to: '/docs/category/shared-packages' },
    size: 'third',
    icon: icon(
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>,
    ),
  },
  {
    dir: 'brand',
    title: 'Brand',
    description: 'Principles, tokens, motion and voice.',
    target: { docId: 'brand/README' },
    size: 'quarter',
    icon: icon(
      <>
        <path d="M12 3a9 9 0 0 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5Z" />
        <circle cx="7.5" cy="11" r="1" />
        <circle cx="10" cy="7" r="1" />
        <circle cx="15" cy="7.5" r="1" />
      </>,
    ),
  },
  {
    dir: 'infrastructure',
    title: 'Infrastructure',
    description: 'Deploys, backups and observability.',
    target: { to: '/docs/category/infrastructure' },
    size: 'quarter',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="7" rx="2" />
        <rect x="3" y="13" width="18" height="7" rx="2" />
        <path d="M7 7.5h.01M7 16.5h.01" />
      </>,
    ),
  },
  {
    dir: 'guides',
    title: 'Guides',
    description: 'Contributing, environment, seeding and testing.',
    target: { to: '/docs/category/guides' },
    size: 'quarter',
    icon: icon(
      <>
        <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5Z" />
        <path d="M4 19a2 2 0 0 1 2-2h14" />
      </>,
    ),
  },
  {
    dir: 'plans',
    title: 'Plans',
    description: 'Implementation plans for work in progress.',
    target: { docId: 'plans/README' },
    size: 'quarter',
    icon: icon(<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />),
  },
  {
    dir: 'specs',
    title: 'Specs',
    description: 'Feature specifications written before they become decisions.',
    target: { docId: 'specs/README' },
    size: 'half',
    icon: icon(
      <>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </>,
    ),
  },
  {
    dir: 'strategy',
    title: 'Strategy',
    description: 'Who Bitrate serves first and how the roadmap follows from it.',
    target: { docId: 'strategy/README' },
    size: 'half',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>,
    ),
  },
]

const GETTING_STARTED = [
  { id: 'getting-started/introduction', title: 'Introduction', hint: 'What lives where' },
  { id: 'getting-started/architecture', title: 'Architecture', hint: 'How the apps fit together' },
  { id: 'getting-started/setup', title: 'Setup', hint: 'pnpm, Docker, Task' },
]

const arrow = icon(<path d="M5 12h14M13 6l6 6-6 6" />)

function useDocs(): GlobalDoc[] {
  return useAllDocsData().default?.versions[0]?.docs ?? []
}

/** Records the docs build actually published — a draft ADR has no page to count. */
function usePublishedAdrs(): AdrIndex['adrs'] {
  const { adrs } = usePluginData(ADR_INDEX_PLUGIN) as AdrIndex
  const ids = new Set(useDocs().map((doc) => doc.id))
  return adrs.filter((adr) => ids.has(adr.docId))
}

function Tile({
  to,
  size,
  className,
  children,
}: {
  to: string
  size: TileSize
  className?: string
  children: ReactNode
}): ReactNode {
  return (
    <Link to={to} className={clsx(styles.tile, styles[size], className)}>
      {children}
    </Link>
  )
}

function TileHead({
  title,
  count,
  children,
}: {
  title: string
  count: string
  children: ReactNode
}): ReactNode {
  return (
    <div className={styles.tileHead}>
      <span className={styles.glyph}>{children}</span>
      <Heading as="h2" className={styles.tileTitle}>
        {title}
      </Heading>
      <span className={styles.count}>{count}</span>
    </div>
  )
}

function Bento(): ReactNode {
  const docs = useDocs()
  const pathOf = (id: string) => docs.find((doc) => doc.id === id)?.path ?? '/docs'
  const countIn = (dir: string) => docs.filter((doc) => doc.id.startsWith(`${dir}/`)).length
  const adrs = usePublishedAdrs()

  return (
    <div className={styles.bento}>
      <Tile to={pathOf(GETTING_STARTED[0].id)} size="wide">
        <TileHead title="Getting started" count={`${countIn('getting-started')} pages`}>
          {icon(
            <>
              <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.8-.9.7-2.3-.1-3.1-.8-.8-2.1-.8-2.9.1Z" />
              <path d="M12 15 9 12a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2Z" />
            </>,
          )}
        </TileHead>
        <p className={styles.tileText}>From a clean machine to a running monorepo.</p>
        <ol className={styles.steps}>
          {GETTING_STARTED.map((step) => (
            <li key={step.id}>
              <b>{step.title}</b>
              <span>{step.hint}</span>
            </li>
          ))}
        </ol>
      </Tile>

      <Tile to={pathOf('architecture/README')} size="third" className={styles.tall}>
        <TileHead title="Architecture" count={String(adrs.length)}>
          {icon(
            <>
              <path d="m12 3 9 5-9 5-9-5 9-5Z" />
              <path d="m3 13 9 5 9-5" />
            </>,
          )}
        </TileHead>
        <p className={styles.tileText}>Every decision with its context and consequences.</p>
        <ul className={styles.adrList}>
          {adrs.slice(0, LATEST_ADR_COUNT).map((adr) => (
            <li key={adr.number}>
              <code>{adr.number}</code>
              <span>{adr.title}</span>
            </li>
          ))}
        </ul>
        <span className={styles.go}>All records {arrow}</span>
      </Tile>

      {/* A section whose pages are all drafts has nothing to link to in a production build. */}
      {SECTIONS.filter((section) => countIn(section.dir) > 0).map((section) => (
        <Tile
          key={section.dir}
          to={'docId' in section.target ? pathOf(section.target.docId) : section.target.to}
          size={section.size}
        >
          <TileHead title={section.title} count={String(countIn(section.dir))}>
            {section.icon}
          </TileHead>
          <p className={styles.tileText}>{section.description}</p>
          <span className={styles.go}>Open {arrow}</span>
        </Tile>
      ))}
    </div>
  )
}

function Hero(): ReactNode {
  const docs = useDocs()
  const adrCount = usePublishedAdrs().length
  return (
    <header className={styles.hero}>
      <p className={styles.overline}>Bitrate documentation</p>
      <Heading as="h1" className={styles.title}>
        How Bitrate is built, run and released.
      </Heading>
      <p className={styles.lede}>
        Architecture decisions, application guides and operating runbooks for the people who
        contribute to Bitrate and keep it running.
      </p>
      <div className={styles.actions}>
        <Link className="button button--primary button--lg" to="/docs/getting-started/introduction">
          Get started {arrow}
        </Link>
        <Link className="button button--secondary button--lg" to="/docs/architecture/">
          Browse ADRs
        </Link>
      </div>
      <p className={styles.meta}>
        <span>
          <b>{adrCount}</b> architecture records
        </span>
        <span>
          <b>{docs.length}</b> pages
        </span>
      </p>
    </header>
  )
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title="Documentation" description={siteConfig.tagline}>
      <main className={styles.home}>
        <Hero />
        <Bento />
      </main>
    </Layout>
  )
}
