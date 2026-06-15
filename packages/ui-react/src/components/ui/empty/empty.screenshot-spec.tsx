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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('empty-default')
  })
})
