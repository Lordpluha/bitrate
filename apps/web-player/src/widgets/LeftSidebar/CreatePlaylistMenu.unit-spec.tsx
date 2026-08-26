import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreatePlaylistMenu } from './CreatePlaylistMenu'

describe('CreatePlaylistMenu', () => {
  it('uses disclosure semantics and closes after a successful create', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(true)
    render(<CreatePlaylistMenu isPending={false} onCreate={onCreate} />)

    const trigger = screen.getByRole('button', { name: 'Create' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: /Playlist/ }))
    expect(onCreate).toHaveBeenCalledOnce()
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    )
    expect(trigger).toHaveFocus()
  })

  it('keeps the options open when creation fails', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(false)
    render(<CreatePlaylistMenu isPending={false} onCreate={onCreate} />)

    const trigger = screen.getByRole('button', { name: 'Create' })
    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: /Playlist/ }))

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
