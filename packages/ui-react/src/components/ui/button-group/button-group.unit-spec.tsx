import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '../button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'

describe('ButtonGroup', () => {
  it('renders a group role', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('groups multiple buttons', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument()
  })

  it('reflects the orientation via data attribute', () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>One</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('renders ButtonGroupText content', () => {
    render(
      <ButtonGroup>
        <ButtonGroupText>Label</ButtonGroupText>
      </ButtonGroup>,
    )
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('renders a ButtonGroupSeparator', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <ButtonGroupSeparator />
        <Button>Two</Button>
      </ButtonGroup>,
    )
    const sep = document.querySelector('[data-slot="button-group-separator"]')
    expect(sep).toBeInTheDocument()
  })
})
