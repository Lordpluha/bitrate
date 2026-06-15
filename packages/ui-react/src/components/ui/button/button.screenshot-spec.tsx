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
    await expect(page.getByTestId('subject')).toMatchScreenshot('button-default')
  })

  it('destructive variant', async () => {
    render(
      <div data-testid="subject">
        <Button variant="destructive">Delete</Button>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('button-destructive')
  })

  it('primary variant', async () => {
    render(
      <div data-testid="subject">
        <Button variant="primary">Primary</Button>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('button-primary')
  })

  it('loading state', async () => {
    render(
      <div data-testid="subject">
        <Button isLoading>Loading</Button>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('button-loading')
  })
})
