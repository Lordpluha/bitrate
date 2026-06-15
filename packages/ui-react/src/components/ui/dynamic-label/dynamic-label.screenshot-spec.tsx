import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { DynamicLabel } from './dynamic-label'

describe('DynamicLabel screenshots', () => {
  it('default idle', async () => {
    render(
      <div data-testid="subject" style={{ position: 'relative', height: 48, width: 240 }}>
        <DynamicLabel>Email</DynamicLabel>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('dynamic-label-idle')
  })

  it('contrast variant', async () => {
    render(
      <div data-testid="subject" style={{ position: 'relative', height: 48, width: 240 }}>
        <DynamicLabel variant="contrast">Email</DynamicLabel>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('dynamic-label-contrast')
  })
})
