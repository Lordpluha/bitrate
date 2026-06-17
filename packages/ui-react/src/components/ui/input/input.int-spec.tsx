import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input integration', () => {
  it('accepts typed text in an uncontrolled input', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'hello')
    expect(input.value).toBe('hello')
  })

  it('fires focus and blur handlers', async () => {
    let focused = false
    let blurred = false
    render(
      <Input
        onFocus={() => {
          focused = true
        }}
        onBlur={() => {
          blurred = true
        }}
      />,
    )
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    expect(focused).toBe(true)
    await userEvent.tab()
    expect(blurred).toBe(true)
  })
})
