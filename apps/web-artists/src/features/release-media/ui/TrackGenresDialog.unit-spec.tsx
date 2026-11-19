import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { TrackGenresDialog } from './TrackGenresDialog'
import {
  AMBIENT,
  draftRelease,
  HOUSE,
  POP,
  RELEASE_ID,
  TECHNO,
  TRACK_ID,
} from './testing/releaseFixture'

const save = {
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  error: null as Error | null,
}
const catalogue = {
  data: [AMBIENT, HOUSE, POP, TECHNO] as (typeof HOUSE)[] | undefined,
  isPending: false,
  isError: false,
}

vi.mock('@entities/release', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/release')>()),
  useGenres: () => catalogue,
  useSaveTrackGenres: () => save,
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
  save.mutateAsync.mockReset().mockResolvedValue(undefined)
  save.error = null
  catalogue.data = [AMBIENT, HOUSE, POP, TECHNO]
})

const renderDialog = (genres: (typeof HOUSE)[] = [], onSaved = vi.fn()) => {
  render(
    <TrackGenresDialog
      artistId="artist-1"
      onClose={vi.fn()}
      onSaved={onSaved}
      release={draftRelease(genres)}
      trackId={TRACK_ID}
    />,
  )
  return onSaved
}

const saveButton = () => screen.getByRole('button', { name: 'Save genres' })

describe('TrackGenresDialog', () => {
  it('starts from the recording genres and saves the chosen catalogue IDs', async () => {
    const onSaved = renderDialog([HOUSE])
    expect(screen.getByRole('checkbox', { name: 'House' })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Techno' }))
    fireEvent.click(saveButton())
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(save.mutateAsync).toHaveBeenCalledWith({
      id: RELEASE_ID,
      trackId: TRACK_ID,
      genreIds: [HOUSE.id, TECHNO.id],
      expectedUpdatedAt: '2026-11-02T10:00:00.000Z',
    })
  })

  it('allows at most three genres', () => {
    renderDialog([HOUSE, TECHNO, AMBIENT])
    expect(screen.getByRole('checkbox', { name: 'Pop' })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Ambient' }))
    expect(screen.getByRole('checkbox', { name: 'Pop' })).toBeEnabled()
  })

  it('needs at least one genre before saving', () => {
    renderDialog()
    expect(saveButton()).toBeDisabled()
  })

  it('narrows the list by name and keeps chosen genres visible', () => {
    renderDialog([HOUSE])
    fireEvent.change(screen.getByRole('searchbox', { name: 'Find a genre' }), {
      target: { value: 'tech' },
    })
    expect(screen.getByRole('checkbox', { name: 'Techno' })).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Pop' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Remove House' }),
    ).toBeInTheDocument()
  })

  it('reports a catalogue that could not load', () => {
    catalogue.data = undefined
    catalogue.isError = true
    renderDialog()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Genres could not be loaded',
    )
    catalogue.isError = false
  })
})
