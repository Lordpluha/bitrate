import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Toaster } from './sonner'

describe('Sonner snapshots', () => {
  it('matches snapshot — default toaster', () => {
    const { container } = render(<Toaster />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
