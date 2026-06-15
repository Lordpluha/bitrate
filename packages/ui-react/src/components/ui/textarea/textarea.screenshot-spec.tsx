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
    await expect(page.getByTestId('subject')).toMatchScreenshot('textarea-default')
  })
})
