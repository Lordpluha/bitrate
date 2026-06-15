import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

describe('Select screenshots', () => {
  it('closed trigger', async () => {
    render(
      <div data-testid="subject" style={{ width: 240 }}>
        <Select defaultValue="a">
          <SelectTrigger>
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot('select-closed')
  })
})
