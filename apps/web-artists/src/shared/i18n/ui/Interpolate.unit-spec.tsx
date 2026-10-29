import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Interpolate } from './Interpolate'

describe('Interpolate', () => {
  it('places elements where the translated sentence names them', () => {
    const { container } = render(
      <Interpolate
        message="Akceptuję {privacy} oraz {terms}."
        values={{
          terms: <a href="/terms">Warunki</a>,
          privacy: <a href="/privacy">Politykę</a>,
        }}
      />,
    )

    expect(container).toHaveTextContent('Akceptuję Politykę oraz Warunki.')
    expect(screen.getByRole('link', { name: 'Warunki' })).toHaveAttribute(
      'href',
      '/terms',
    )
  })

  it('leaves a placeholder without a value as written', () => {
    const { container } = render(
      <Interpolate message="Hello {name}" values={{}} />,
    )

    expect(container).toHaveTextContent('Hello {name}')
  })
})
