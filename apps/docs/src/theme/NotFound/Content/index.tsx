import Link from '@docusaurus/Link'
import Heading from '@theme/Heading'
import type { Props } from '@theme/NotFound/Content'
import clsx from 'clsx'
import type { ReactNode } from 'react'

import styles from './styles.module.css'

const START_POINTS = [
  { label: 'Getting started', to: '/docs/getting-started/introduction' },
  { label: 'Architecture decisions', to: '/docs/architecture/' },
  { label: 'Search the docs', to: '/search' },
]

export default function NotFoundContent({ className }: Props): ReactNode {
  return (
    <main className={clsx(styles.notFound, className)}>
      <p className={styles.code}>404 · Page not found</p>
      <Heading as="h1" className={styles.title}>
        This page isn’t in the docs.
      </Heading>
      <p className={styles.lede}>
        It may have moved when the docs were reorganised. Start from one of these instead.
      </p>
      <ul className={styles.links}>
        {START_POINTS.map((point) => (
          <li key={point.to}>
            <Link to={point.to}>
              {point.label}
              <span>{point.to}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
