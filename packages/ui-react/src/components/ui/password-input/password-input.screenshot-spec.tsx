import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { PasswordInput } from './password-input'

describe('PasswordInput screenshots', () => {
  it('all states', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, width: 280 }}
      >
        <PasswordInput placeholder="Hidden" />
        <PasswordInput showPassword placeholder="Visible" />
        <div className="bg-contrast p-2" style={{ display: 'inline-block' }}>
          <PasswordInput variant="contrast" placeholder="Contrast" />
        </div>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
