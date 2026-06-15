import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Carousel } from './carousel'

describe('Carousel screenshots', () => {
  it('with slides', async () => {
    render(
      <div data-testid="subject" style={{ width: 400 }}>
        <Carousel>
          <Carousel.Content>
            <Carousel.Item>Slide 1</Carousel.Item>
            <Carousel.Item>Slide 2</Carousel.Item>
          </Carousel.Content>
        </Carousel>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('carousel-default')
  })
})
