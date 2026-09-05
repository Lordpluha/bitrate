import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from './empty'

describe('Empty integration', () => {
  it('renders interactive content that handles clicks', async () => {
    const handler = vi.fn()
    render(
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Empty</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <button type="button" onClick={handler}>
            Retry
          </button>
        </EmptyContent>
      </Empty>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
