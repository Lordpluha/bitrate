import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { ButtonGroup } from './button-group'

describe('ButtonGroup screenshots', () => {
  it('horizontal', async () => {
    render(
      <div data-testid="subject">
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('button-group-horizontal')
  })

  it('vertical', async () => {
    render(
      <div data-testid="subject">
        <ButtonGroup orientation="vertical">
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('button-group-vertical')
  })
})
