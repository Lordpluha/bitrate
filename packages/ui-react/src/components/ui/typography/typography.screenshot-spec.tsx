import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { Typography } from './typography'

describe('Typography screenshots', () => {
  it('heading scale', async () => {
    render(
      <div data-testid="subject">
        <Typography level={1}>Heading 1</Typography>
        <Typography level={3}>Heading 3</Typography>
        <Typography level={6}>Heading 6</Typography>
        <Typography as="p">Body text</Typography>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
