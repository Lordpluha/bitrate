import type { PromotionStep } from '@entities/promotion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PlanStepRow } from './PlanStepRow'

const patch = vi.hoisted(() => vi.fn())
vi.mock('@shared/api/fetchClient', () => ({
  clientFetchClient: { PATCH: patch },
}))

const RELEASE = '019a0000-0000-7000-8000-000000000001'
const step: PromotionStep = {
  id: '019a0000-0000-7000-8000-000000000002',
  position: 0,
  offsetDays: -21,
  dueAt: '2026-09-05T18:00:00Z',
  phase: 'PRE',
  kind: 'POST',
  channels: ['INSTAGRAM', 'TELEGRAM'],
  title: 'Announce the release date',
  body: 'Afterglow arrives Sep 26.',
  state: 'SUGGESTED',
  aiGenerated: true,
  regenerating: false,
  regenerationFailure: null,
}

function show(overrides: Partial<PromotionStep> = {}, canGenerate = true) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <ol>
        <PlanStepRow
          artistId="artist-1"
          canGenerate={canGenerate}
          onOpenPosts={vi.fn()}
          releaseId={RELEASE}
          step={{ ...step, ...overrides }}
        />
      </ol>
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

describe('PlanStepRow', () => {
  beforeEach(() => patch.mockReset())

  it('dates the step from the release and marks AI text', () => {
    show()
    expect(
      screen.getByText(/T−21 · Sep 5 — Announce the release date/),
    ).toBeInTheDocument()
    expect(screen.getByText('Post · Instagram, Telegram')).toBeInTheDocument()
    expect(screen.getByText('Created with AI')).toBeInTheDocument()
    expect(screen.getByText('Suggested')).toBeInTheDocument()
  })

  it('approves a suggested step', async () => {
    patch.mockResolvedValue({ response: new Response(null, { status: 500 }) })
    const user = show()
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith(
        '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}',
        expect.objectContaining({
          params: { path: { releaseId: RELEASE, stepId: step.id } },
          body: { action: 'approve' },
        }),
      ),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Could not change the step/,
    )
  })

  it('offers done but no approval on the artist’s own edited step, without the AI marker', () => {
    show({ state: 'EDITED', aiGenerated: false })
    expect(screen.queryByText('Created with AI')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Approve' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mark as done' }),
    ).toBeInTheDocument()
  })

  it('hides regeneration once the allowance is used', () => {
    show({}, false)
    expect(
      screen.queryByRole('button', { name: 'Regenerate' }),
    ).not.toBeInTheDocument()
  })

  it('waits for a step being rewritten', () => {
    show({ regenerating: true })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Writing a new suggestion…',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
