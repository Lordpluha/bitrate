import { Inter, JetBrains_Mono, Unbounded } from 'next/font/google'
import type { PropsWithChildren } from 'react'

/* Brand typography for the landing only (the rest of the app moves to it separately). */
const display = Unbounded({
  variable: '--font-landing-display',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
})
const body = Inter({
  variable: '--font-landing-body',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
})
const data = JetBrains_Mono({
  variable: '--font-landing-data',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['500'],
})

export default function HomeLayout({ children }: PropsWithChildren) {
  return (
    <div className={`${display.variable} ${body.variable} ${data.variable}`}>
      {children}
    </div>
  )
}
