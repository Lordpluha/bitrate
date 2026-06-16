import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
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
