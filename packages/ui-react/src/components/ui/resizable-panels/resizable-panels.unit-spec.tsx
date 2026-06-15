import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResizableHandle, ResizableLayout, ResizablePanel } from './resizable-panels'

describe('ResizablePanels', () => {
  it('renders the panel group with its panels', () => {
    render(
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
    expect(screen.getByText('Left')).toBeInTheDocument()
    expect(screen.getByText('Right')).toBeInTheDocument()
  })

  it('renders panel content for vertical direction', () => {
    render(
      <ResizableLayout direction="vertical">
        <ResizablePanel>
          <div>Top</div>
        </ResizablePanel>
        <ResizablePanel>
          <div>Bottom</div>
        </ResizablePanel>
      </ResizableLayout>,
    )
    expect(screen.getByText('Top')).toBeInTheDocument()
    expect(screen.getByText('Bottom')).toBeInTheDocument()
  })
})
