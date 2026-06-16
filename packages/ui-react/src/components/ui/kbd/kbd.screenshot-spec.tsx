import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Kbd, KbdGroup } from './kbd'

describe('Kbd screenshots', () => {
  it('single and group', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', gap: 12, padding: 8, alignItems: 'center' }}
      >
        <Kbd>Ctrl</Kbd>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
