import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'

describe('Empty screenshots', () => {
  it('all compositions', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', gap: 24, padding: 8 }}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nothing here</EmptyTitle>
            <EmptyDescription>Try again later</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">⭐</EmptyMedia>
            <EmptyTitle>No results</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
