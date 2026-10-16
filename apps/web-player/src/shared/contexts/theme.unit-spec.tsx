import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from './theme'

describe('ThemeProvider', () => {
  it('renders its children on the server, before the persisted theme hydrates', () => {
    const html = renderToString(
      <ThemeProvider>
        <h1>Your music, already where you are.</h1>
      </ThemeProvider>,
    )

    expect(html).toContain('Your music, already where you are.')
  })
})
