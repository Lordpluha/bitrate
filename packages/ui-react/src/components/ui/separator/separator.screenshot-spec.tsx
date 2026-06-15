import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator screenshots', () => {
  it('horizontal', async () => {
    render(
      <div data-testid="subject" style={{ width: 200 }}>
        <Separator />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('separator-horizontal')
  })

  it('vertical', async () => {
    render(
      <div data-testid="subject" style={{ height: 80 }}>
        <Separator orientation="vertical" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('separator-vertical')
  })
})
