import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge snapshots', () => {
  it.each([
    'default',
    'secondary',
    'destructive',
    'outline',
  ] as const)('matches snapshot — %s variant', (variant) => {
    const { container } = render(<Badge variant={variant}>{variant}</Badge>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
