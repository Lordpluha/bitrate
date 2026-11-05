import localFont from 'next/font/local'

/**
 * Brand typography (Unbounded headings, Inter text, JetBrains Mono data) shared by the landing
 * and the auth screens; the rest of the app moves to it separately.
 */
const display = localFont({
  src: './files/Unbounded.woff2',
  variable: '--font-landing-display',
  weight: '500 800',
  display: 'swap',
})
const body = localFont({
  src: './files/Inter.woff2',
  variable: '--font-landing-body',
  weight: '400 700',
  display: 'swap',
})
const data = localFont({
  src: './files/JetBrainsMono.woff2',
  variable: '--font-landing-data',
  weight: '500',
  display: 'swap',
})

/** Puts the three font variables on an element; descendants pick them with `var(...)`. */
export const brandFontVariables = `${display.variable} ${body.variable} ${data.variable}`
