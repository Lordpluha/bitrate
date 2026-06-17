import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './input-group'

describe('InputGroup screenshots', () => {
  it('with leading addon', async () => {
    render(
      <div data-testid="subject" style={{ width: 280 }}>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="username" />
        </InputGroup>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
