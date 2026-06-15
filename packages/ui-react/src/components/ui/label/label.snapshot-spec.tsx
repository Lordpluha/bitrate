import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label snapshots', () => {
  it('matches snapshot — default', () => {
    const { container } = render(<Label htmlFor="email">Email</Label>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
