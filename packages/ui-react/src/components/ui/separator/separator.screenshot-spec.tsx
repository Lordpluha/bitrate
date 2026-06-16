import { render } from '@testing-library/react'
import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator screenshots', () => {
  it('horizontal and vertical', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
        <div style={{ width: 200 }}><Separator /></div>
        <div style={{ height: 80, display: 'flex' }}><Separator orientation="vertical" /></div>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
