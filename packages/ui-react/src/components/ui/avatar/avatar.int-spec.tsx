import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar integration', () => {
  it('shows the fallback when no image resolves', () => {
    render(
      <Avatar>
        <AvatarImage src="" alt="user" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('FB')).toBeInTheDocument()
  })

  it('composes root, image and fallback together', () => {
    const { container } = render(
      <Avatar data-testid="avatar">
        <AvatarImage src="" alt="user" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('[data-testid="avatar"]')).toContainElement(
      screen.getByText('FB'),
    )
  })
})
