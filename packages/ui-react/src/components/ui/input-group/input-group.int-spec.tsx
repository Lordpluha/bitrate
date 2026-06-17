import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group'

describe('InputGroup integration', () => {
  it('lets the user type into the grouped input', async () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
      </InputGroup>,
    )
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement
    await userEvent.type(input, 'query')
    expect(input.value).toBe('query')
  })

  it('handles clicks on an addon button', async () => {
    const handler = vi.fn()
    render(
      <InputGroup>
        <InputGroupInput />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handler}>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
