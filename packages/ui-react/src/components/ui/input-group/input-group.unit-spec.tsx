import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from './input-group'

describe('InputGroup', () => {
  it('renders a group with an input control', () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
      </InputGroup>,
    )
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
  })

  it('marks the root with the input-group data-slot', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput />
      </InputGroup>,
    )
    expect(container.querySelector('[data-slot="input-group"]')).toBeInTheDocument()
  })

  it('renders an inline-start addon', () => {
    render(
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput />
      </InputGroup>,
    )
    const addon = document.querySelector('[data-slot="input-group-addon"]')
    expect(addon).toHaveAttribute('data-align', 'inline-start')
    expect(screen.getByText('@')).toBeInTheDocument()
  })

  it('renders an inline-end addon with a button', () => {
    render(
      <InputGroup>
        <InputGroupInput />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })

  it('applies the input-group-control slot to the input', () => {
    render(
      <InputGroup>
        <InputGroupInput />
      </InputGroup>,
    )
    expect(document.querySelector('[data-slot="input-group-control"]')).toBeInTheDocument()
  })
})
