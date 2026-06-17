import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Typography } from './typography'

describe('Typography integration', () => {
  it('composes a heading and a body paragraph together', () => {
    render(
      <article>
        <Typography level={2}>Album title</Typography>
        <Typography as="p">A description of the album.</Typography>
      </article>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Album title' })).toBeInTheDocument()
    expect(screen.getByText('A description of the album.').tagName).toBe('P')
  })
})
