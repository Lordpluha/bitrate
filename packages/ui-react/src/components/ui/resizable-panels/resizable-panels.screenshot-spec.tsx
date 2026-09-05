import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { ResizableHandle, ResizableLayout, ResizablePanel } from './resizable-panels'

describe('ResizablePanels screenshots', () => {
  it('horizontal and vertical', async () => {
    render(
      <div
        data-testid="subject"
        style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}
      >
        <div style={{ width: 400, height: 100 }}>
          <ResizableLayout>
            <ResizablePanel>
              <div style={{ padding: 8 }}>Left</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <div style={{ padding: 8 }}>Right</div>
            </ResizablePanel>
          </ResizableLayout>
        </div>
        <div style={{ width: 300, height: 150 }}>
          <ResizableLayout direction="vertical" style={{ height: 150 }}>
            <ResizablePanel defaultSize={50}>Top</ResizablePanel>
            <ResizablePanel defaultSize={50}>Bottom</ResizablePanel>
          </ResizableLayout>
        </div>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
