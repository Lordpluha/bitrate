import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback } from './avatar'

describe('Avatar screenshots', () => {
  it('all variants', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', gap: 12, padding: 8 }}>
        <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
        <Avatar><AvatarFallback delayMs={0}>?</AvatarFallback></Avatar>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
