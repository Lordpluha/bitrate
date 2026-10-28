import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LockedButton } from './LockedButton'

const reason = 'Locked while Bitrate reviews this release.'

describe('LockedButton', () => {
  it('keeps its own name, describes the reason and never acts', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(
      <form onSubmit={(event) => submit(event.nativeEvent as SubmitEvent)}>
        <LockedButton reason={reason}>Edit details</LockedButton>
      </form>,
    )
    const button = screen.getByRole('button', { name: 'Edit details' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAccessibleDescription(reason)
    await userEvent.click(button)
    expect(submit).not.toHaveBeenCalled()
  })

  it('shows the reason on keyboard focus', async () => {
    render(<LockedButton reason={reason}>Edit details</LockedButton>)
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Edit details' })).toHaveFocus()
    await waitFor(() =>
      expect(screen.getAllByText(reason).length).toBeGreaterThan(1),
    )
  })
})
