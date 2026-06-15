import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Toaster } from './sonner'

describe('Sonner screenshots', () => {
  it('default toaster', async () => {
    render(
      <div data-testid="subject">
        <Toaster />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('sonner-default')
  })
})
