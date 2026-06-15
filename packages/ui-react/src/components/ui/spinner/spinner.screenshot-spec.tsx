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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('spinner-default')
  })

  it('large', async () => {
    render(
      <div data-testid="subject">
        <Spinner className="size-8" />
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('spinner-large')
  })
})
