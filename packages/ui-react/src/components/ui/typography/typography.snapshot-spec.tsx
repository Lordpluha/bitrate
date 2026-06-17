import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Typography } from './typography'

describe('Typography snapshots', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)('matches snapshot — heading level %i', (level) => {
    const { container } = render(<Typography level={level}>Heading {level}</Typography>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — body paragraph', () => {
    const { container } = render(<Typography as="p">Body text</Typography>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
