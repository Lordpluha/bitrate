import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './input-group'

describe('InputGroup snapshots', () => {
  it('matches snapshot — input only', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
      </InputGroup>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — with leading addon', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput />
      </InputGroup>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
