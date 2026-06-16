import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge screenshots', () => {
  it('all variants', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', gap: 8, padding: 8 }}>
        {(['default', 'secondary', 'destructive', 'outline'] as const).map(variant => (
          <Badge key={variant} variant={variant}>{variant}</Badge>
        ))}
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
