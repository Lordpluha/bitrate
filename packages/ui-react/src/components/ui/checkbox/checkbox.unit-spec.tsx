import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox aria-label="Accept" />)
    expect(screen.getByRole('checkbox', { name: 'Accept' })).not.toBeChecked()
  })

  it('reports the new value when toggled', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />)

    await userEvent.click(screen.getByRole('checkbox', { name: 'Accept' }))

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything())
    expect(screen.getByRole('checkbox', { name: 'Accept' })).toBeChecked()
  })

  it('toggles from the keyboard', async () => {
    render(<Checkbox aria-label="Accept" />)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(screen.getByRole('checkbox', { name: 'Accept' })).toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    render(<Checkbox aria-label="Accept" disabled />)

    await userEvent.click(screen.getByRole('checkbox', { name: 'Accept' }))

    expect(screen.getByRole('checkbox', { name: 'Accept' })).not.toBeChecked()
  })

  it('merges a custom className', () => {
    render(<Checkbox aria-label="Accept" className="custom" />)
    expect(screen.getByRole('checkbox', { name: 'Accept' })).toHaveClass('custom')
  })
})
