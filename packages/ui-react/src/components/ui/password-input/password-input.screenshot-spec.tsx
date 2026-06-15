import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput screenshots', () => {
  it('hidden', async () => {
    render(
      <div data-testid="subject" style={{ width: 280 }}>
        <PasswordInput placeholder="Password" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('password-input-hidden')
  })

  it('visible', async () => {
    render(
      <div data-testid="subject" style={{ width: 280 }}>
        <PasswordInput showPassword placeholder="Password" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('password-input-visible')
  })
})
