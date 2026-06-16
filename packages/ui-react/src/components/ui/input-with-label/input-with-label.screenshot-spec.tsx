import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { InputWithLabel } from './input-with-label'

describe('InputWithLabel screenshots', () => {
  it('idle', async () => {
    render(
      <div data-testid="subject" style={{ width: 280, padding: 8 }}>
        <InputWithLabel label="Email" id="email" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
