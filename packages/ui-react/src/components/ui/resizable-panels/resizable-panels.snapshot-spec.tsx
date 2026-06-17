import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResizableHandle, ResizableLayout, ResizablePanel } from './resizable-panels'

describe('ResizablePanels snapshots', () => {
  it('matches snapshot — two panels horizontal', () => {
    const { container } = render(
      <ResizableLayout>
        <ResizablePanel>
          <div>Left</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <div>Right</div>
        </ResizablePanel>
      </ResizableLayout>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — vertical layout', () => {
    const { container } = render(
      <ResizableLayout direction="vertical">
        <ResizablePanel defaultSize={50}>
          <div>Top</div>
        </ResizablePanel>
        <ResizablePanel defaultSize={50}>
          <div>Bottom</div>
        </ResizablePanel>
      </ResizableLayout>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
