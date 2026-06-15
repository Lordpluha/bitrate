import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverTrigger } from './popover'

describe('Popover snapshots', () => {
  it('matches snapshot — closed trigger', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
      </Popover>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
