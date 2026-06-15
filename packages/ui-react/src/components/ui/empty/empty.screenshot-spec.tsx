import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from './empty'

describe('Empty screenshots', () => {
  it('default composition', async () => {
    render(
      <div data-testid="subject">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nothing here</EmptyTitle>
            <EmptyDescription>Try again later</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('empty-default')
  })
})
