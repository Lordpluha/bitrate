import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Carousel } from './carousel'

describe('Carousel snapshots', () => {
  it('matches snapshot — horizontal with slides', () => {
    const { container } = render(
      <Carousel>
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
          <Carousel.Item>Slide 2</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — vertical orientation', () => {
    const { container } = render(
      <Carousel orientation="vertical">
        <Carousel.Content>
          <Carousel.Item>Slide 1</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
