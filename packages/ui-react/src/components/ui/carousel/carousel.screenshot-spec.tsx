import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { Carousel } from './carousel'

describe('Carousel screenshots', () => {
  it('horizontal and vertical', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
        <div style={{ width: 400 }}>
          <Carousel>
            <Carousel.Content>
              <Carousel.Item>Slide 1</Carousel.Item>
              <Carousel.Item>Slide 2</Carousel.Item>
            </Carousel.Content>
          </Carousel>
        </div>
        <div style={{ height: 200 }}>
          <Carousel orientation="vertical" className="h-48">
            <Carousel.Content className="h-48">
              <Carousel.Item>Slide 1</Carousel.Item>
              <Carousel.Item>Slide 2</Carousel.Item>
            </Carousel.Content>
          </Carousel>
        </div>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
