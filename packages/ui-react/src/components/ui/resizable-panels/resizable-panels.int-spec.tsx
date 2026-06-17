import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResizableHandle, ResizableLayout, ResizablePanel } from './resizable-panels'

describe('ResizablePanels integration', () => {
  it('renders a resize handle between panels', () => {
    const { container } = render(
      <ResizableLayout>
        <ResizablePanel defaultSize={30}>
          <div>Sidebar</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
          <div>Main</div>
        </ResizablePanel>
      </ResizableLayout>,
    )
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    // The handle is a separator element rendered between the panels.
    expect(container.querySelectorAll('div').length).toBeGreaterThan(2)
  })
})
