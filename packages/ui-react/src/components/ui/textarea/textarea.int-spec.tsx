import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea integration', () => {
  it('accepts typed multi-line input', async () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await userEvent.type(textarea, 'line one{enter}line two')
    expect(textarea.value).toBe('line one\nline two')
  })

  it('does not accept input when disabled', async () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await userEvent.type(textarea, 'nope')
    expect(textarea.value).toBe('')
  })
})
