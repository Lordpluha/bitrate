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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('button-group-horizontal')
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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('button-group-vertical')
  })
})
