import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Button } from '../button'
import { ButtonGroup } from './button-group'

describe('ButtonGroup screenshots', () => {
  it('all orientations', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', gap: 16, padding: 8 }}>
        <ButtonGroup>
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button>One</Button>
          <Button>Two</Button>
        </ButtonGroup>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
