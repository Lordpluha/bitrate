import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback } from './avatar'

describe('Avatar screenshots', () => {
  it('fallback', async () => {
    render(
      <div data-testid="subject">
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('avatar-fallback')
  })

  it('empty', async () => {
    render(
      <div data-testid="subject">
        <Avatar />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('avatar-empty')
  })
})
