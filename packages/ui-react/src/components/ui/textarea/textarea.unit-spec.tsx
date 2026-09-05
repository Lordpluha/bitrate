import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textbox', () => {
    render(<Textarea placeholder="Notes" />)
    expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument()
  })

  it('reflects a controlled value', () => {
    render(<Textarea value="hello" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('hello')
  })

  it('calls onChange', () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('merges a custom className', () => {
    render(<Textarea className="custom" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom')
  })
})
