import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { InputProvider } from '../input-context'
import { DynamicLabel } from './dynamic-label'

describe('DynamicLabel screenshots', () => {
  it('all variants', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}
      >
        <div style={{ position: 'relative', height: 48, width: 240 }}>
          <DynamicLabel>Email</DynamicLabel>
        </div>
        <div style={{ position: 'relative', height: 48, width: 240 }}>
          <DynamicLabel variant="contrast">Email contrast</DynamicLabel>
        </div>
        <InputProvider>
          <div style={{ position: 'relative', width: 300, padding: 8 }}>
            <DynamicLabel htmlFor="search-s" variant="search">
              Search
            </DynamicLabel>
          </div>
        </InputProvider>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
