import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { RenameTrackDialog } from './TrackManageDialogs'
import { draftRelease, RELEASE_ID, TRACK_ID } from './testing/releaseFixture'

const rename = {
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  error: null as Error | null,
}

vi.mock('@entities/release', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/release')>()),
  useRenameTrack: () => rename,
}))

beforeAll(() => {
  // jsdom has no modal dialogs.
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close() {
    this.open = false
  }
})

beforeEach(() => {
  rename.mutateAsync.mockReset().mockResolvedValue(undefined)
  rename.error = null
})

const renderDialog = (onSaved = vi.fn()) => {
  render(
    <RenameTrackDialog
      artistId="artist-1"
      onClose={vi.fn()}
      onSaved={onSaved}
      release={draftRelease()}
      trackId={TRACK_ID}
    />,
  )
  return { onSaved, title: screen.getByLabelText('Track title') }
}

describe('RenameTrackDialog', () => {
  it('saves the trimmed title against the version read when it opened', async () => {
    const { onSaved, title } = renderDialog()
    fireEvent.change(title, { target: { value: '  Night drive (Extended)  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save title' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(rename.mutateAsync).toHaveBeenCalledWith({
      id: RELEASE_ID,
      trackId: TRACK_ID,
      title: 'Night drive (Extended)',
      expectedUpdatedAt: '2026-11-02T10:00:00.000Z',
    })
  })

  it('keeps saving disabled until the title changes', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: 'Save title' })).toBeDisabled()
  })

  it('asks for a title instead of saving a blank one', () => {
    const { title } = renderDialog()
    fireEvent.change(title, { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save title' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a title')
    expect(rename.mutateAsync).not.toHaveBeenCalled()
  })
})
