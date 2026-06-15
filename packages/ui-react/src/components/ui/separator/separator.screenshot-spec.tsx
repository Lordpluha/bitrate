import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator screenshots', () => {
  it('horizontal', async () => {
    render(
      <div data-testid="subject" style={{ width: 200, padding: '8px 0' }}>
        <Separator />
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('separator-horizontal')
  })

  it('vertical', async () => {
    render(
      <div data-testid="subject" style={{ height: 80, padding: '0 8px', display: 'flex' }}>
        <Separator orientation="vertical" />
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('separator-vertical')
  })
})
