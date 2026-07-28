'use client'

import { useRef, useState } from 'react'
import {
  LEFT_SIDEBAR_DEFAULT_SIZE,
  LEFT_SIDEBAR_DRAG_MAX_SIZE,
  LEFT_SIDEBAR_EXPANDED_SIZE,
  LEFT_SIDEBAR_MIN_SIZE,
  RIGHT_SIDEBAR_COLLAPSED_SIZE,
  RIGHT_SIDEBAR_DEFAULT_SIZE,
  RIGHT_SIDEBAR_MAX_SIZE,
  RIGHT_SIDEBAR_MIN_SIZE,
  RIGHT_SIDEBAR_MIN_VIEWPORT_WIDTH,
} from '@/app/main/mainShellResize.constants'
import {
  clamp,
  getLeftSidebarMaxSize,
  getMainShellGridTemplate,
  getRightSidebarMaxSize,
} from '@/app/main/mainShellResize.utils'
import { useHorizontalResize, useWindowWidth } from '@/shared/hooks'

interface UseMainShellResizeParams {
  hasPlayer: boolean
}

export const useMainShellResize = ({ hasPlayer }: UseMainShellResizeParams) => {
  const windowWidth = useWindowWidth()
  const hasRightSidebar =
    hasPlayer && windowWidth >= RIGHT_SIDEBAR_MIN_VIEWPORT_WIDTH
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false)
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)
  const [leftSidebarSize, setLeftSidebarSize] = useState(
    LEFT_SIDEBAR_DEFAULT_SIZE,
  )
  const [rightSidebarSize, setRightSidebarSize] = useState(
    RIGHT_SIDEBAR_DEFAULT_SIZE,
  )
  const shellRef = useRef<HTMLDivElement | null>(null)
  const activeRightSidebarSize = hasRightSidebar ? rightSidebarSize : 0
  const leftSidebarMaxSize = getLeftSidebarMaxSize(activeRightSidebarSize)
  const rightSidebarMaxSize = getRightSidebarMaxSize(
    isLibraryExpanded,
    leftSidebarSize,
  )

  const handleCollapseRightSidebar = () => {
    setRightSidebarSize(RIGHT_SIDEBAR_COLLAPSED_SIZE)
    setIsRightSidebarCollapsed(true)
  }

  const handleExpandRightSidebar = () => {
    setRightSidebarSize(RIGHT_SIDEBAR_DEFAULT_SIZE)
    setIsRightSidebarCollapsed(false)
  }

  const handleToggleLibraryExpanded = () => {
    setIsLibraryExpanded((currentValue) => {
      const nextValue = !currentValue

      setIsLibraryCollapsed(false)

      if (!nextValue) {
        setLeftSidebarSize(LEFT_SIDEBAR_DEFAULT_SIZE)
      }

      return nextValue
    })
  }

  const handleToggleLibraryCollapsed = () => {
    setIsLibraryCollapsed((currentValue) => {
      const nextValue = !currentValue

      if (nextValue) {
        setIsLibraryExpanded(false)
        return true
      }

      setLeftSidebarSize(LEFT_SIDEBAR_DEFAULT_SIZE)
      return false
    })
  }

  const leftResize = useHorizontalResize({
    keyboard: {
      increaseKey: 'ArrowRight',
      max: leftSidebarMaxSize,
      min: LEFT_SIDEBAR_MIN_SIZE,
      onResize: setLeftSidebarSize,
      value: leftSidebarSize,
    },
    onResize: (clientX) => {
      const rect = shellRef.current?.getBoundingClientRect()
      if (!rect) return

      const rawSize = ((clientX - rect.left) / rect.width) * 100
      setLeftSidebarSize(
        clamp(rawSize, LEFT_SIDEBAR_MIN_SIZE, leftSidebarMaxSize),
      )
    },
    onResizeStart: () => {
      setIsLibraryExpanded(false)
      setIsLibraryCollapsed(false)
    },
  })
  const rightResize = useHorizontalResize({
    disabled: isRightSidebarCollapsed,
    keyboard: {
      increaseKey: 'ArrowLeft',
      max: rightSidebarMaxSize,
      min: RIGHT_SIDEBAR_MIN_SIZE,
      onResize: setRightSidebarSize,
      value: rightSidebarSize,
    },
    onResize: (clientX) => {
      const rect = shellRef.current?.getBoundingClientRect()
      if (!rect) return

      const rawSize = ((rect.right - clientX) / rect.width) * 100
      const nextSize = clamp(
        rawSize,
        RIGHT_SIDEBAR_MIN_SIZE,
        rightSidebarMaxSize,
      )

      setRightSidebarSize(nextSize)
      setIsRightSidebarCollapsed(nextSize <= RIGHT_SIDEBAR_COLLAPSED_SIZE)
    },
  })

  const gridTemplateColumns = getMainShellGridTemplate({
    hasRightSidebar,
    isLibraryCollapsed,
    isLibraryExpanded,
    leftSidebarSize,
    rightSidebarSize,
  })

  return {
    gridTemplateColumns,
    handleCollapseRightSidebar,
    handleExpandRightSidebar,
    handleToggleLibraryCollapsed,
    handleToggleLibraryExpanded,
    hasRightSidebar,
    isLibraryCollapsed,
    isLibraryExpanded,
    isResizing: leftResize.isResizing || rightResize.isResizing,
    isRightSidebarCollapsed,
    leftResizeHandleProps: leftResize.resizeHandleProps,
    leftResizeLimits: {
      max: isLibraryExpanded
        ? LEFT_SIDEBAR_EXPANDED_SIZE
        : LEFT_SIDEBAR_DRAG_MAX_SIZE,
      min: LEFT_SIDEBAR_MIN_SIZE,
      value: isLibraryExpanded ? LEFT_SIDEBAR_EXPANDED_SIZE : leftSidebarSize,
    },
    rightResizeLimits: {
      max: RIGHT_SIDEBAR_MAX_SIZE,
      min: RIGHT_SIDEBAR_MIN_SIZE,
      value: rightSidebarSize,
    },
    rightResizeHandleProps: rightResize.resizeHandleProps,
    shellRef,
  }
}
