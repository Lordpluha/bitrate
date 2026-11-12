import type { ArtistReleaseChange } from '@entities/release'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProposeReleaseChangesDialog } from './ProposeReleaseChangesDialog'
import { ReleaseChangesPanel } from './ReleaseChangesPanel'

const submit = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null as Error | null,
}
const withdraw = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null as Error | null,
}
const changes = {
  data: [] as ArtistReleaseChange[],
  error: null as Error | null,
  isSuccess: true,
}

vi.mock('@entities/release', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/release')>()),
  useSubmitReleaseChanges: () => submit,
  useWithdrawReleaseChanges: () => withdraw,
  useReleaseChanges: () => changes,
}))

const release = {
  id: '019a0000-0000-7000-8000-000000000201',
  title: 'Night Signal',
  cover: null,
}
const recordings = [
  { id: '019a0000-0000-7000-8000-000000000301', title: 'Intro' },
  { id: '019a0000-0000-7000-8000-000000000302', title: 'Outro' },
]

const change = (
  overrides: Partial<ArtistReleaseChange>,
): ArtistReleaseChange => ({
  id: '019a0000-0000-7000-8000-000000000401',
  requestId: '019a0000-0000-7000-8000-000000000501',
  field: 'RELEASE_TITLE',
  recordingId: null,
  previousValue: 'Night Signal',
  proposedValue: 'Night Signal (Deluxe)',
  status: 'PENDING',
  reason: null,
  decidedAt: null,
  createdAt: '2026-11-12T10:00:00.000Z',
  reviewerMessage: null,
  ...overrides,
})

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
  submit.mutateAsync.mockReset().mockResolvedValue(undefined)
  withdraw.mutateAsync.mockReset().mockResolvedValue(undefined)
  changes.data = []
})

describe('ProposeReleaseChangesDialog', () => {
  it('sends only the values the artist changed', async () => {
    const onClose = vi.fn()
    render(
      <ProposeReleaseChangesDialog
        artistId="artist-1"
        onClose={onClose}
        recordings={recordings}
        release={release}
      />,
    )
    fireEvent.change(screen.getByLabelText('Release title'), {
      target: { value: ' Night Signal (Deluxe) ' },
    })
    fireEvent.change(screen.getByLabelText('Outro'), {
      target: { value: 'Outro (Edit)' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send for review' }))
    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(submit.mutateAsync).toHaveBeenCalledWith({
      id: release.id,
      title: 'Night Signal (Deluxe)',
      recordings: [{ id: recordings[1]?.id, title: 'Outro (Edit)' }],
    })
  })

  it('explains that nothing changed instead of sending', async () => {
    render(
      <ProposeReleaseChangesDialog
        artistId="artist-1"
        onClose={vi.fn()}
        recordings={recordings}
        release={release}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send for review' }))
    expect(
      await screen.findByText('Change at least one value'),
    ).toBeInTheDocument()
    expect(submit.mutateAsync).not.toHaveBeenCalled()
  })

  it('locks a value that already waits for review', () => {
    changes.data = [change({})]
    render(
      <ProposeReleaseChangesDialog
        artistId="artist-1"
        onClose={vi.fn()}
        recordings={recordings}
        release={release}
      />,
    )
    expect(screen.getByLabelText('Release title')).toBeDisabled()
    expect(screen.getByLabelText('Intro')).toBeEnabled()
  })
})

describe('ReleaseChangesPanel', () => {
  it('shows a pending change as old → new and withdraws its request', async () => {
    changes.data = [change({})]
    render(
      <ReleaseChangesPanel
        artistId="artist-1"
        recordings={recordings}
        release={release}
      />,
    )
    expect(screen.getByText('Night Signal (Deluxe)')).toBeInTheDocument()
    expect(screen.getByText('In review')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw' }))
    await waitFor(() =>
      expect(withdraw.mutateAsync).toHaveBeenCalledWith({
        id: release.id,
        requestId: '019a0000-0000-7000-8000-000000000501',
      }),
    )
  })

  it('shows why a recording title was rejected', () => {
    changes.data = [
      change({
        field: 'RECORDING_TITLE',
        recordingId: recordings[0]?.id ?? null,
        previousValue: 'Intro',
        proposedValue: 'INTRO!!!',
        status: 'REJECTED',
        reason: 'Please avoid **all caps**',
        decidedAt: '2026-11-12T11:00:00.000Z',
      }),
    ]
    render(
      <ReleaseChangesPanel
        artistId="artist-1"
        recordings={recordings}
        release={release}
      />,
    )
    expect(screen.getByText('Recording title · Intro')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('all caps')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Withdraw' })).toBeNull()
  })
})
