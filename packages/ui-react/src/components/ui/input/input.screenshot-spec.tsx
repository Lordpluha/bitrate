import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Input } from './input'

describe('Input screenshots', () => {
  it('all variants', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, width: 240 }}
      >
        {(['default', 'contrast', 'search'] as const).map((variant) => (
          <Input key={variant} variant={variant} placeholder={variant} />
        ))}
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
