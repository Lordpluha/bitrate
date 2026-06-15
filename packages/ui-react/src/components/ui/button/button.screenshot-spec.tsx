import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button screenshots', () => {
  it('default variant', async () => {
    render(
      <div data-testid="subject">
        <Button>Default Button</Button>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('button-default')
  })

  it('destructive variant', async () => {
    render(
      <div data-testid="subject">
        <Button variant="destructive">Delete</Button>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('button-destructive')
  })

  it('primary variant', async () => {
    render(
      <div data-testid="subject">
        <Button variant="primary">Primary</Button>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('button-primary')
  })

  it('loading state', async () => {
    render(
      <div data-testid="subject">
        <Button isLoading>Loading</Button>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('button-loading')
  })
})
