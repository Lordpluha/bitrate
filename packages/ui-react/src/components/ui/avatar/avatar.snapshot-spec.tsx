import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback } from './avatar'

describe('Avatar snapshots', () => {
  it('matches snapshot — empty avatar', () => {
    const { container } = render(<Avatar />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — with fallback', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
