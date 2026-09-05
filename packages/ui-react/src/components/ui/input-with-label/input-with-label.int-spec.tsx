import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InputWithLabel } from './input-with-label'

describe('InputWithLabel integration', () => {
  it('floats the label when the input is focused', async () => {
    render(<InputWithLabel label="Email" />)
    const label = screen.getByText('Email')
    expect(label).toHaveClass('top-1/2')
    await userEvent.click(screen.getByRole('textbox'))
    expect(label).toHaveClass('-top-2')
  })

  it('keeps the label floating after typing a value', async () => {
    render(<InputWithLabel label="Email" />)
    await userEvent.type(screen.getByRole('textbox'), 'hi')
    await userEvent.tab()
    expect(screen.getByText('Email')).toHaveClass('-top-2')
  })
})
