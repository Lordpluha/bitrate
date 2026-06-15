import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputProvider } from './input-context'

describe('InputContext snapshots', () => {
  it('matches snapshot — provider renders its children transparently', () => {
    const { container } = render(
      <InputProvider>
        <div className="child">content</div>
      </InputProvider>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
