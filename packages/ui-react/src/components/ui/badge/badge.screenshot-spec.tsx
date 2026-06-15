import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge screenshots', () => {
  for (const variant of ['default', 'secondary', 'destructive', 'outline'] as const) {
    it(`${variant} variant`, async () => {
      render(
        <div data-testid="subject">
          <Badge variant={variant}>{variant}</Badge>
        </div>,
      )
      const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
      expect(base64).toMatchSnapshot(`badge-${variant}`)
    })
  }
})
