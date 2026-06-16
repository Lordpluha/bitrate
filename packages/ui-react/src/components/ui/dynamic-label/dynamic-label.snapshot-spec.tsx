import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputProvider } from '../input-context'
import { DynamicLabel } from './dynamic-label'

describe('DynamicLabel snapshots', () => {
  it('matches snapshot — default variant idle', () => {
    const { container } = render(<DynamicLabel>Email</DynamicLabel>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — contrast variant', () => {
    const { container } = render(<DynamicLabel variant="contrast">Email</DynamicLabel>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — search variant', () => {
    const { container } = render(
      <InputProvider>
        <DynamicLabel variant="search">Search</DynamicLabel>
      </InputProvider>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
