import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import Heading from '@theme/Heading'
import Layout from '@theme/Layout'
import clsx from 'clsx'
import type { ReactNode } from 'react'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          🎵 {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/introduction"
          >
            Get Started →
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/blog"
            style={{ marginLeft: '1rem' }}
          >
            📰 Blog
          </Link>
        </div>
        <div style={{ marginTop: '2rem', opacity: 0.9 }}>
          <p>
            <strong>Open Source</strong> • <strong>TypeScript</strong> • <strong>Monorepo</strong>
          </p>
        </div>
      </div>
    </header>
  )
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={`Documentation`}
      description="Complete documentation for Spotify Clone - open source music streaming platform built with modern web technologies"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
