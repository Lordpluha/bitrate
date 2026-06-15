import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button integration', () => {
  it('handles keyboard activation', async () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    const btn = screen.getByRole('button')
    btn.focus()
    await userEvent.keyboard('{Enter}')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not fire click when disabled', async () => {
    const handler = vi.fn()
    render(
      <Button disabled onClick={handler}>
        No click
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(handler).not.toHaveBeenCalled()
  })

  it('fires click on pointer interaction', async () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Press</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
