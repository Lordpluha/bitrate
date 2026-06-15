import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

describe('Select integration', () => {
  it('opens the listbox when the trigger is clicked', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>,
    )
    await userEvent.click(screen.getByRole('combobox'))
    await waitFor(() => expect(screen.getByText('Option A')).toBeInTheDocument())
  })

  it('selects a value and calls onValueChange', async () => {
    const onValueChange = vi.fn()
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>,
    )
    await userEvent.click(screen.getByRole('combobox'))
    const option = await screen.findByText('Option B')
    await userEvent.click(option)
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('b'))
  })
})
