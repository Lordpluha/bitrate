import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator integration', () => {
  it('separates two content blocks within a layout', () => {
    render(
      <div>
        <p>Above</p>
        <Separator />
        <p>Below</p>
      </div>,
    )
    expect(screen.getByText('Above')).toBeInTheDocument()
    expect(screen.getByText('Below')).toBeInTheDocument()
  })

  it('exposes a semantic separator role when not decorative', () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
