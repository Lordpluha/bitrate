'use client'

import React from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { cn } from '@spotify/ui/lib/utils'

export interface ResizablePanelProps {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
  children: React.ReactNode
}

export interface ResizableLayoutProps {
  direction?: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
}

export interface ResizableHandleProps {
  className?: string
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
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

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
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

export const ResizableHandle: React.FC<ResizableHandleProps> = ({
  className,
}) => {
  return (
    <PanelResizeHandle
      className={cn(
        'w-1 bg-border hover:bg-primary transition-all duration-200 cursor-col-resize',
        className
      )}
    />
  )
}
