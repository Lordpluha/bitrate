import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea screenshots', () => {
  it('default', async () => {
    render(
      <div data-testid="subject" style={{ width: 280 }}>
        <Textarea placeholder="Write something..." />
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('textarea-default')
  })
})
