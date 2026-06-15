import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Toaster, toast } from './sonner'

describe('Sonner Toaster', () => {
  it('renders without crashing', () => {
    const { container } = render(<Toaster />)
    expect(container).toBeTruthy()
  })

  it('renders a toaster region element', () => {
    render(<Toaster />)
    expect(document.querySelector('.toaster')).toBeInTheDocument()
  })

  it('re-exports the toast function', () => {
    expect(typeof toast).toBe('function')
  })
})
