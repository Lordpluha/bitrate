import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { FormFixture } from './form.fixture'

describe('Form screenshots', () => {
  it('labelled field', async () => {
    render(
      <div data-testid="subject">
        <FormFixture />
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
