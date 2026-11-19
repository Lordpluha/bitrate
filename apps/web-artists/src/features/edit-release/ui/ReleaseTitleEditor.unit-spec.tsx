import type { ReleaseSummary } from '@entities/release'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReleaseTitleEditor } from './ReleaseTitleEditor'

const update = {
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  error: null as Error | null,
}

vi.mock('@entities/release', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@entities/release')>()),
  useUpdateRelease: () => update,
}))

const draft: ReleaseSummary = {
  id: '019a0000-0000-7000-8000-000000000201',
  title: 'Night Signal',
  type: 'SINGLE',
  status: 'DRAFT',
  upc: null,
  scheduledAt: null,
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
}

beforeEach(() => {
  update.mutateAsync.mockReset().mockResolvedValue(undefined)
})

describe('ReleaseTitleEditor', () => {
  it('renames a draft with the trimmed title and the version it showed', async () => {
    const onSaved = vi.fn()
    render(
      <ReleaseTitleEditor
        artistId="artist-1"
        onSaved={onSaved}
        release={draft}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Edit release title' }))
    fireEvent.change(screen.getByLabelText('Release title'), {
      target: { value: '  Night Signal (Deluxe)  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(update.mutateAsync).toHaveBeenCalledWith({
      id: draft.id,
      input: {
        title: 'Night Signal (Deluxe)',
        expectedUpdatedAt: '2026-11-02T10:00:00.000Z',
      },
    })
  })

  it('keeps the entered title when the write is rejected', async () => {
    update.mutateAsync.mockRejectedValue(new Error('release.error.changed'))
    render(
      <ReleaseTitleEditor
        artistId="artist-1"
        onSaved={vi.fn()}
        release={draft}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Edit release title' }))
    fireEvent.change(screen.getByLabelText('Release title'), {
      target: { value: 'Night Signal (Deluxe)' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(update.mutateAsync).toHaveBeenCalled())
    expect(screen.getByLabelText('Release title')).toHaveValue(
      'Night Signal (Deluxe)',
    )
  })

  it('offers no rename once the release left the draft stage', () => {
    render(
      <ReleaseTitleEditor
        artistId="artist-1"
        onSaved={vi.fn()}
        release={{ ...draft, status: 'SUBMITTED' }}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Night Signal' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit release title' }),
    ).not.toBeInTheDocument()
  })
})
