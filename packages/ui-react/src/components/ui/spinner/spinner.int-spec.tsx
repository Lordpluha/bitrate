import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './spinner'

describe('Spinner integration', () => {
  it('can be used as an inline loading indicator inside a button', () => {
    render(
      <button type="button" disabled>
        <Spinner />
        Loading
      </button>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
