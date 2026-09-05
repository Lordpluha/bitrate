import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input snapshots', () => {
  it.each([
    'default',
    'contrast',
    'search',
  ] as const)('matches snapshot — %s variant', (variant) => {
    const { container } = render(<Input variant={variant} placeholder="placeholder" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
