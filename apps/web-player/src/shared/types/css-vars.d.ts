import 'react'

/** Lets inline styles carry CSS custom properties (`style={{ '--x': 62 }}`) without casts. */
declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined
  }
}
