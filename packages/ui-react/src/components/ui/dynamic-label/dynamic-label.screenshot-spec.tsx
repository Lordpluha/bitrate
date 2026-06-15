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
    await expect(page.getByTestId('subject')).toMatchScreenshot('dynamic-label-idle')
  })

  it('contrast variant', async () => {
    render(
      <div data-testid="subject" style={{ position: 'relative', height: 48, width: 240 }}>
        <DynamicLabel variant="contrast">Email</DynamicLabel>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('dynamic-label-contrast')
  })
})
