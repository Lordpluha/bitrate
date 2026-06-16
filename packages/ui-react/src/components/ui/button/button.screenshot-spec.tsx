import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Button } from './button'

describe('Button screenshots', () => {
  it('all variants', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8 }}>
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="contrast">Contrast</Button>
        <Button variant="link">Link</Button>
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm">Small</Button>
        <Button size="icon" aria-label="icon">
          🔍
        </Button>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
