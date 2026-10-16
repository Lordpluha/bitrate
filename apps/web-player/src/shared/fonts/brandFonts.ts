import { Inter, JetBrains_Mono, Unbounded } from 'next/font/google'

/**
 * Brand typography (Unbounded headings, Inter text, JetBrains Mono data) shared by the landing
 * and the auth screens; the rest of the app moves to it separately.
 */
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

/** Puts the three font variables on an element; descendants pick them with `var(...)`. */
export const brandFontVariables = `${display.variable} ${body.variable} ${data.variable}`
