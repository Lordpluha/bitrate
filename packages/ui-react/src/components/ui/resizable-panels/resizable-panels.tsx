'use client'

import { cn } from '@/lib/utils'
import type { FC, ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export interface ResizablePanelProps {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
  children: ReactNode
}

export interface ResizableLayoutProps {
  direction?: 'horizontal' | 'vertical'
  className?: string
  children: ReactNode
}

export interface ResizableHandleProps {
  className?: string
}

export const ResizableLayout: FC<ResizableLayoutProps> = ({
  direction = 'horizontal',
  className,
  children,
}) => {
  return (
    <PanelGroup direction={direction} className={cn('h-full', className)}>
      {children}
    </PanelGroup>
  )
}

export const ResizablePanel: FC<ResizablePanelProps> = ({
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  className,
  children,
}) => {
  return (
    <Panel
      defaultSize={defaultSize}
      minSize={minSize}
      maxSize={maxSize}
      className={cn('overflow-hidden', className)}
    >
      {children}
    </Panel>
  )
}

export const ResizableHandle: FC<ResizableHandleProps> = ({ className }) => {
  return (
    <PanelResizeHandle
      className={cn(
        'w-1 bg-border hover:bg-primary transition-all duration-200 cursor-col-resize',
        className,
      )}
    />
  )
}
