import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Kbd, KbdGroup } from './kbd'

describe('Kbd screenshots', () => {
  it('single key', async () => {
    render(
      <div data-testid="subject">
        <Kbd>Ctrl</Kbd>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('kbd-single')
  })

  it('group', async () => {
    render(
      <div data-testid="subject">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('kbd-group')
  })
})
