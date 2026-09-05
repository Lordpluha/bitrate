import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Textarea } from './textarea'

describe('Textarea screenshots', () => {
  it('default and disabled', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, width: 280 }}
      >
        <Textarea placeholder="Write something..." />
        <Textarea disabled placeholder="Cannot edit" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
