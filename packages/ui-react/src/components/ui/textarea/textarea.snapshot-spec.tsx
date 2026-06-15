import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea snapshots', () => {
  it('matches snapshot — default', () => {
    const { container } = render(<Textarea placeholder="Notes" />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — disabled', () => {
    const { container } = render(<Textarea disabled placeholder="Notes" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
