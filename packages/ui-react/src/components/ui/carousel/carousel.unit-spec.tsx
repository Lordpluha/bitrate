import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Carousel } from './carousel'

describe('Carousel', () => {
  it('renders a carousel region', () => {
    render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )
    expect(screen.getByRole('region', { name: /carousel/i })).toBeInTheDocument()
  })

  it('renders the slide content', () => {
    render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
          <Carousel.Item>Slide 2</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })

  it('marks each item with the slide roledescription', () => {
    render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )
    expect(screen.getByText('Slide 1')).toHaveAttribute('aria-roledescription', 'slide')
  })

  it('hides navigation when showNavigation is false', () => {
    render(
      <Carousel showNavigation={false}>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel>,
    )
    expect(screen.queryByText('Previous slide')).not.toBeInTheDocument()
    expect(screen.queryByText('Next slide')).not.toBeInTheDocument()
  })

  it('renders navigation buttons by default', () => {
    render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel>,
    )
    expect(screen.getByText('Previous slide')).toBeInTheDocument()
    expect(screen.getByText('Next slide')).toBeInTheDocument()
  })
})
