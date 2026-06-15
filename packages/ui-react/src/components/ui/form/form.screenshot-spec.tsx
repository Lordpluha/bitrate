import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { FormFixture } from './form.fixture'

describe('Form screenshots', () => {
  it('labelled field', async () => {
    render(
      <div data-testid="subject">
        <FormFixture />
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('form-field')
  })
})
