import Heading from '@theme/Heading'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  emoji: string
  description: ReactNode
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Modern Stack',
    emoji: '⚡',
    description: (
      <>
        Built with <strong>TypeScript</strong>, <strong>NestJS</strong>, <strong>Next.js</strong>{' '}
        and <strong>React Native</strong>. Full type safety and best development practices.
      </>
    ),
  },
  {
    title: 'Cross-Platform',
    emoji: '📱',
    description: (
      <>
        Works everywhere: <strong>Web</strong>, <strong>Mobile</strong> (iOS/Android),{' '}
        <strong>Desktop</strong> (Windows/macOS/Linux). One codebase, multiple platforms.
      </>
    ),
  },
  {
    title: 'Scalable Architecture',
    emoji: '🏗️',
    description: (
      <>
        Monorepo with <strong>Turborepo</strong>, microservices architecture, Docker
        containerization and production-ready setup.
      </>
    ),
  },
  {
    title: 'High Quality Audio',
    emoji: '🎧',
    description: (
      <>
        Support for <strong>OGG Opus</strong> and <strong>AAC</strong> codecs. FFmpeg conversion for
        optimal quality and file size.
      </>
    ),
  },
  {
    title: 'Complete Documentation',
    emoji: '📚',
    description: (
      <>
        Comprehensive API documentation, development guides, code examples and best practices.
        Everything you need to get started.
      </>
    ),
  },
  {
    title: 'Open Source',
    emoji: '💚',
    description: (
      <>
        Fully open source under <strong>MIT License</strong>. Contributions are welcome!
      </>
    ),
  },
]

function Feature({ title, emoji, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureEmoji}>{emoji}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
