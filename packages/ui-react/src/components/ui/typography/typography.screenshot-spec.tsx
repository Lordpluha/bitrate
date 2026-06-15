import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
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
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('typography-scale')
  })
})
