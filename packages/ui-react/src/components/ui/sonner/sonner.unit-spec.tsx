import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Toaster, toast } from './sonner'

describe('Sonner Toaster', () => {
  it('renders without crashing', () => {
    const { container } = render(<Toaster />)
    expect(container).toBeTruthy()
  })

  it('renders a toaster region element', () => {
    const { container } = render(<Toaster />)
    // Sonner renders an <ol> inside a <section> — presence of any child is enough
    expect(container.firstChild).toBeInTheDocument()
  })

  it('re-exports the toast function', () => {
    expect(typeof toast).toBe('function')
  })

  it('exports toast.success function', () => {
    expect(typeof toast.success).toBe('function')
  })

  it('exports toast.error function', () => {
    expect(typeof toast.error).toBe('function')
  })

  it('exports toast.warning function', () => {
    expect(typeof toast.warning).toBe('function')
  })

  it('exports toast.info function', () => {
    expect(typeof toast.info).toBe('function')
  })

  it('exports toast.promise function', () => {
    expect(typeof toast.promise).toBe('function')
  })
})
