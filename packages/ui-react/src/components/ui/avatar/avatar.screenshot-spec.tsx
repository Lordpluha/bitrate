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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('avatar-fallback')
  })

  it('no image shows fallback placeholder', async () => {
    render(
      <div style={{ display: 'inline-block', padding: 8 }}>
        <Avatar>
          <AvatarFallback delayMs={0}>?</AvatarFallback>
        </Avatar>
      </div>,
    )
    const { base64 } = await page.screenshot({ base64: true })
    expect(base64).toMatchSnapshot('avatar-no-image')
  })
})
