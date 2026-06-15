import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputWithLabel } from './input-with-label'

describe('InputWithLabel snapshots', () => {
  it('matches snapshot — default', () => {
    const { container } = render(<InputWithLabel label="Email" id="email" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
