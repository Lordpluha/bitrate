import type { PromotionTranslation } from '@entities/promotion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TranslationEditor } from './TranslationEditor'

vi.mock('@shared/api/fetchClient', () => ({ clientFetchClient: {} }))

const translation: PromotionTranslation = {
  id: '019a0000-0000-7000-8000-000000000003',
  language: 'uk',
  text: 'Afterglow виходить 26 вересня.',
  state: 'MACHINE',
  aiGenerated: true,
  rating: null,
}

function show(overrides: Partial<PromotionTranslation> = {}) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TranslationEditor
        postId="019a0000-0000-7000-8000-000000000004"
        stepRef={{ artistId: 'a', releaseId: 'r', stepId: 's' }}
        translation={{ ...translation, ...overrides }}
      />
    </QueryClientProvider>,
  )
}

describe('TranslationEditor', () => {
  it('labels a machine translation for review', () => {
    show()
    expect(
      screen.getByText('Machine translation · please review'),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Українська' })).toHaveValue(
      translation.text,
    )
  })

  it('asks the artist to review a translation whose English changed', () => {
    show({ state: 'STALE' })
    expect(screen.getByText('English changed, review it')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Translate again' }),
    ).toBeInTheDocument()
  })
})
