import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label integration', () => {
  it('focuses the associated input when clicked', async () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </div>,
    )
    await userEvent.click(screen.getByText('Email'))
    expect(screen.getByRole('textbox')).toHaveFocus()
  })
})
