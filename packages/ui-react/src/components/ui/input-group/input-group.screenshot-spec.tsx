import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('input-group-addon')
  })
})
