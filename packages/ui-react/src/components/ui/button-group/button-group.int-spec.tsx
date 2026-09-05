import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../button'
import { ButtonGroup } from './button-group'

describe('ButtonGroup integration', () => {
  it('lets individual buttons receive clicks', async () => {
    const first = vi.fn()
    const second = vi.fn()
    render(
      <ButtonGroup>
        <Button onClick={first}>One</Button>
        <Button onClick={second}>Two</Button>
      </ButtonGroup>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Two' }))
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
  })
})
