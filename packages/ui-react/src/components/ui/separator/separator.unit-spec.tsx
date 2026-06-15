import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    const { container } = render(<Separator />)
    const sep = container.firstChild as HTMLElement
    expect(sep).toHaveAttribute('data-orientation', 'horizontal')
    expect(sep).toHaveClass('h-px')
  })

  it('renders a vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const sep = container.firstChild as HTMLElement
    expect(sep).toHaveAttribute('data-orientation', 'vertical')
    expect(sep).toHaveClass('w-px')
  })

  it('is decorative by default', () => {
    const { container } = render(<Separator />)
    // Decorative separators have role="none".
    expect(container.firstChild).toHaveAttribute('role', 'none')
  })

  it('merges a custom className', () => {
    const { container } = render(<Separator className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })
})
