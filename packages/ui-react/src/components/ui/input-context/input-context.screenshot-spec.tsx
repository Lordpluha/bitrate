import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { InputProvider } from './input-context'

describe('InputContext screenshots', () => {
  it('renders children transparently', async () => {
    render(
      <div data-testid="subject">
        <InputProvider>
          <div style={{ padding: 8 }}>Context child</div>
        </InputProvider>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('input-context-child')
  })
})
