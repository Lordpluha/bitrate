import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

describe('Select snapshots', () => {
  it('matches snapshot — closed trigger', () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — open state', () => {
    const { container } = render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Active</SelectItem>
          <SelectItem value="b" disabled>Disabled</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(container).toMatchSnapshot()
  })
})
