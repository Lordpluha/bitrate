import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
  it('renders the root with default classes', () => {
    const { container } = render(<Avatar data-testid="avatar" />)
    const root = container.querySelector('[data-testid="avatar"]')
    expect(root).toBeInTheDocument()
    expect(root).toHaveClass('rounded-full')
  })

  it('merges custom className on the root', () => {
    const { container } = render(<Avatar className="custom-class" data-testid="avatar" />)
    expect(container.querySelector('[data-testid="avatar"]')).toHaveClass('custom-class')
  })

  it('renders the fallback content', () => {
    const { getByText } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(getByText('AB')).toBeInTheDocument()
  })

  it('renders the fallback with merged className', () => {
    const { getByText } = render(
      <Avatar>
        <AvatarFallback className="extra">CD</AvatarFallback>
      </Avatar>,
    )
    expect(getByText('CD')).toHaveClass('extra')
  })

  it('exposes AvatarImage as a component', () => {
    expect(typeof AvatarImage).toBe('function')
  })
})
