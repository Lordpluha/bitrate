import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { ButtonGroup } from './button-group'

describe('ButtonGroup snapshots', () => {
  it('matches snapshot — horizontal', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — vertical', () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
