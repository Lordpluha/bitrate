import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input screenshots', () => {
  for (const variant of ['default', 'contrast', 'search'] as const) {
    it(`${variant} variant`, async () => {
      render(
        <div data-testid="subject" style={{ width: 240 }}>
          <Input variant={variant} placeholder="Placeholder" />
        </div>,
      )
      await expect(page.getByTestId('subject')).toMatchScreenshot(`input-${variant}`)
    })
  }
})
