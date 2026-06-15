import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner screenshots', () => {
  it('default', async () => {
    render(
      <div data-testid="subject">
        <Spinner />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('spinner-default')
  })

  it('large', async () => {
    render(
      <div data-testid="subject">
        <Spinner className="size-8" />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('spinner-large')
  })
})
