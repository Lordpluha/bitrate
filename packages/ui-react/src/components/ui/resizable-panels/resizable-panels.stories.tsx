import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  ResizableHandle,
  ResizableLayout,
  ResizablePanel,
} from '.'

const PanelContent = ({ label }: { label: string }) => (
  <div className="flex h-full items-center justify-center text-sm text-foreground/70">
    {label}
  </div>
)

/**
 * Resizable panels layout for splitting content areas.
 */
const meta: Meta<typeof ResizableLayout> = {
  title: 'ui/ResizablePanels',
  component: ResizableLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    direction: 'horizontal',
  },
} satisfies Meta<typeof ResizableLayout>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Horizontal layout with two resizable panels.
 */
export const Horizontal: Story = {
  render: (args) => (
    <div className="h-64 w-[720px] rounded-lg border bg-card">
      <ResizableLayout
        {...args}
        className={["h-full", args.className].filter(Boolean).join(' ')}
      >
        <ResizablePanel defaultSize={55} className="bg-muted/30">
          <PanelContent label="Library" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={45} className="bg-card">
          <PanelContent label="Now Playing" />
        </ResizablePanel>
      </ResizableLayout>
    </div>
  ),
}

/**
 * Vertical layout for stacked resizable panels.
 */
export const Vertical: Story = {
  render: (args) => (
    <div className="h-80 w-[520px] rounded-lg border bg-card">
      <ResizableLayout
        {...args}
        direction="vertical"
        className={["h-full", args.className].filter(Boolean).join(' ')}
      >
        <ResizablePanel defaultSize={60} className="bg-muted/30">
          <PanelContent label="Playlist" />
        </ResizablePanel>
        <ResizableHandle className="h-1 w-full cursor-row-resize" />
        <ResizablePanel defaultSize={40} className="bg-card">
          <PanelContent label="Queue" />
        </ResizablePanel>
      </ResizableLayout>
    </div>
  ),
}
