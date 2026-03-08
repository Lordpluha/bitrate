'use client'

import { cn } from '@/lib/utils'
import type { FC, ReactNode, RefObject } from 'react'
import { Group, Panel, Separator, usePanelRef } from 'react-resizable-panels'
import type { PanelImperativeHandle, PanelSize } from 'react-resizable-panels'

export { usePanelRef }

export interface ResizablePanelProps {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsible?: boolean
  collapsedSize?: number
  panelRef?: RefObject<PanelImperativeHandle | null>
  onResize?: (size: PanelSize) => void
  className?: string
  children: ReactNode
}

export interface ResizableLayoutProps {
  direction?: 'horizontal' | 'vertical'
  orientation?: 'horizontal' | 'vertical'
  onLayoutChanged?: (layout: Record<string, number>) => void
  className?: string
  children: ReactNode
}

export interface ResizableHandleProps {
  disabled?: boolean
  className?: string
}

export const ResizableLayout: FC<ResizableLayoutProps> = ({
  direction,
  orientation,
  onLayoutChanged,
  className,
  children,
}) => {
  const resolvedOrientation = orientation ?? direction ?? 'horizontal'
  return (
    <Group
      orientation={resolvedOrientation}
      className={cn('h-full', className)}
      onLayoutChanged={onLayoutChanged}
      resizeTargetMinimumSize={{ coarse: 20, fine: 10 }}
    >
      {children}
    </Group>
  )
}

export const ResizablePanel: FC<ResizablePanelProps> = ({
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  collapsible,
  collapsedSize,
  panelRef,
  onResize,
  className,
  children,
}) => {
  // In v4, numeric values are treated as pixels, not percentages.
  // Converting numbers to strings so they are treated as percentages (0..100).
  const toPercent = (v: number | string | undefined) =>
    typeof v === 'number' ? `${v}` : v

  return (
    <Panel
      panelRef={panelRef}
      defaultSize={toPercent(defaultSize)}
      minSize={toPercent(minSize)}
      maxSize={toPercent(maxSize)}
      collapsible={collapsible}
      collapsedSize={toPercent(collapsedSize)}
      onResize={onResize}
      className={cn('overflow-hidden', className)}
    >
      {children}
    </Panel>
  )
}

export const ResizableHandle: FC<ResizableHandleProps> = ({ disabled, className }) => {
  return (
    <Separator
      disabled={disabled}
      className={cn(
        'w-px cursor-col-resize bg-border transition-colors duration-200 opacity-0',
        className,
      )}
    />
  )
}