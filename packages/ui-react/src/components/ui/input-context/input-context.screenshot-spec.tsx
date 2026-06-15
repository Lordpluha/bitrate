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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('input-context-child')
  })
})
