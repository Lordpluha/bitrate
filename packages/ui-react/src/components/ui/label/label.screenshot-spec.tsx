import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label screenshots', () => {
  it('default', async () => {
    render(
      <div data-testid="subject">
        <Label htmlFor="email">Email address</Label>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('label-default')
  })
})
