import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard screenshots', () => {
  it('open hover card', async () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Artist</HoverCardTrigger>
        <HoverCardContent>Monthly listeners</HoverCardContent>
      </HoverCard>,
    )
    await expect(page.elementLocator(document.body)).toMatchScreenshot()
  })
})
