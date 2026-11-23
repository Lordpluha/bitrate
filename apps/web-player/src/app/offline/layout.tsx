import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

/** The offline page is a client component, so its title lives here. */
export const metadata: Metadata = {
  title: 'Offline',
}

export default function OfflineLayout({ children }: PropsWithChildren) {
  return children
}
