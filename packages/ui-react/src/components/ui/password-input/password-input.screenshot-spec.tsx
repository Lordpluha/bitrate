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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('password-input-hidden')
  })

  it('visible', async () => {
    render(
      <div data-testid="subject" style={{ width: 280 }}>
        <PasswordInput showPassword placeholder="Password" />
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('password-input-visible')
  })
})
