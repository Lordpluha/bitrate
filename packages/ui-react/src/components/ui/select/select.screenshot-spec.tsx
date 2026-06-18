import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

describe('Select screenshots', () => {
  it('closed and open', async () => {
    render(
      <div style={{ display: 'flex', gap: 240, padding: 16 }}>
        <div style={{ width: 240 }}>
          <Select defaultValue="a">
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select defaultOpen>
          <SelectTrigger>
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Active</SelectItem>
            <SelectItem value="b" disabled>
              Disabled
            </SelectItem>
          </SelectContent>
        </Select>
      </div>,
    )
    await expect(page.elementLocator(document.body)).toMatchScreenshot()
  })
})
