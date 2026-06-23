'use client'

import type { CSSProperties, FC, ReactNode, Ref } from 'react'
import {
  Panel,
  Group as PanelGroup,
  type PanelImperativeHandle,
  Separator as PanelResizeHandle,
  type PanelSize,
  usePanelRef,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'

export interface ResizablePanelProps {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  collapsedSize?: number
  collapsible?: boolean
  disabled?: boolean
  panelRef?: Ref<PanelImperativeHandle | null>
  onResize?: (
    panelSize: PanelSize,
    id: string | number | undefined,
    prevPanelSize: PanelSize | undefined,
  ) => void
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export interface ResizableLayoutProps {
  direction?: 'horizontal' | 'vertical'
  orientation?: 'horizontal' | 'vertical'
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export interface ResizableHandleProps {
  disabled?: boolean
  className?: string
}

export const ResizableLayout: FC<ResizableLayoutProps> = ({
  direction = 'horizontal',
  orientation,
  className,
  style,
  children,
}) => {
  return (
    <PanelGroup
      orientation={orientation ?? direction}
      className={cn('h-full', className)}
      style={style}
    >
      {children}
    </PanelGroup>
  )
}

export const ResizablePanel: FC<ResizablePanelProps> = ({
  defaultSize = 50,
  minSize = 10,
  maxSize = 90,
  collapsedSize,
  collapsible,
  disabled,
  panelRef,
  onResize,
  className,
  style,
  children,
}) => {
  return (
    <Panel
      collapsedSize={collapsedSize}
      collapsible={collapsible}
      defaultSize={defaultSize}
      disabled={disabled}
      minSize={minSize}
      maxSize={maxSize}
      onResize={onResize}
      panelRef={panelRef}
      className={cn('overflow-hidden', className)}
      style={style}
    >
      {children}
    </Panel>
  )
}

export const ResizableHandle: FC<ResizableHandleProps> = ({ disabled, className }) => {
  return (
    <PanelResizeHandle
      disabled={disabled}
      className={cn(
        'w-1 bg-border hover:bg-primary transition-all duration-200 cursor-col-resize',
        className,
      )}
    />
  )
}

export type { PanelImperativeHandle, PanelSize }
export { usePanelRef }
