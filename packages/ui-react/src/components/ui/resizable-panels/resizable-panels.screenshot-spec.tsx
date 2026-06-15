import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { ResizableHandle, ResizableLayout, ResizablePanel } from './resizable-panels'

describe('ResizablePanels screenshots', () => {
  it('two panels', async () => {
    render(
      <div data-testid="subject" style={{ width: 400, height: 200 }}>
        <ResizableLayout>
          <ResizablePanel>
            <div style={{ padding: 8 }}>Left</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <div style={{ padding: 8 }}>Right</div>
          </ResizablePanel>
        </ResizableLayout>
      </div>,
    )
    const { base64 } = await page.getByTestId('subject').screenshot({ base64: true })
    expect(base64).toMatchSnapshot('resizable-panels-default')
  })
})
