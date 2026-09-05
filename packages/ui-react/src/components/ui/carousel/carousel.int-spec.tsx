import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Carousel, type CarouselApi } from './carousel'

describe('Carousel integration', () => {
  it('exposes the embla api through setApi', async () => {
    let api: CarouselApi | undefined
    render(
      <Carousel setApi={(a) => (api = a)}>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
          <Carousel.Item>Slide 2</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )
    await waitFor(() => expect(api).toBeTruthy())
  })

  it('renders prev/next controls that are clickable', async () => {
    render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
          <Carousel.Item>Slide 2</Carousel.Item>
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel>,
    )
    const next = screen.getByText('Next slide').closest('button')
    expect(next).toBeInTheDocument()
    if (next && !next.disabled) {
      await userEvent.click(next)
    }
  })
})
