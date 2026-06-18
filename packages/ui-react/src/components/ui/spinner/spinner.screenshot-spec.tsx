import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Spinner } from './spinner'

describe('Spinner screenshots', () => {
  it('all sizes', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', gap: 12, padding: 8, alignItems: 'center' }}
      >
        <Spinner />
        <Spinner className="size-8" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
