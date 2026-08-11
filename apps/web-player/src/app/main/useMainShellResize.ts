'use client'

import { useRef } from 'react'
import {
  LEFT_SIDEBAR_DRAG_MAX_SIZE,
  LEFT_SIDEBAR_EXPANDED_SIZE,
  LEFT_SIDEBAR_MIN_SIZE,
  RIGHT_SIDEBAR_MAX_SIZE,
  RIGHT_SIDEBAR_MIN_SIZE,
  RIGHT_SIDEBAR_MIN_VIEWPORT_WIDTH,
} from '@/app/main/mainShellResize.constants'
import {
  getLeftSidebarMaxSize,
  getMainShellGridTemplate,
  getRightSidebarMaxSize,
} from '@/app/main/mainShellResize.utils'
import { selectNowPlayingPanel, useSettingsStore } from '@/entities/Settings'
import { useWindowWidth } from '@/shared/hooks'
import { useMainShellPanelState } from './useMainShellPanelState'
import { useMainShellResizers } from './useMainShellResizers'

interface UseMainShellResizeParams {
  hasPlayer: boolean
}

export const useMainShellResize = ({ hasPlayer }: UseMainShellResizeParams) => {
  const windowWidth = useWindowWidth()
  const showsNowPlayingPanel = useSettingsStore(selectNowPlayingPanel)
  const hasRightSidebar =
    hasPlayer &&
    showsNowPlayingPanel &&
    windowWidth >= RIGHT_SIDEBAR_MIN_VIEWPORT_WIDTH
  const panels = useMainShellPanelState()
  const {
    isLibraryCollapsed,
    isLibraryExpanded,
    isRightSidebarCollapsed,
    leftSidebarSize,
    rightSidebarSize,
    setIsLibraryCollapsed,
    setIsLibraryExpanded,
    setIsRightSidebarCollapsed,
    setLeftSidebarSize,
    setRightSidebarSize,
  } = panels
  const shellRef = useRef<HTMLDivElement | null>(null)
  const activeRightSidebarSize = hasRightSidebar ? rightSidebarSize : 0
  const leftSidebarMaxSize = getLeftSidebarMaxSize(activeRightSidebarSize)
  const rightSidebarMaxSize = getRightSidebarMaxSize(
    isLibraryExpanded,
    leftSidebarSize,
  )

  const { leftResize, rightResize } = useMainShellResizers({
    isRightSidebarCollapsed,
    leftSidebarMaxSize,
    leftSidebarSize,
    rightSidebarMaxSize,
    rightSidebarSize,
    setIsLibraryCollapsed,
    setIsLibraryExpanded,
    setIsRightSidebarCollapsed,
    setLeftSidebarSize,
    setRightSidebarSize,
    shellRef,
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
    handleCollapseRightSidebar: panels.collapseRightSidebar,
    handleExpandRightSidebar: panels.expandRightSidebar,
    handleToggleLibraryCollapsed: panels.toggleLibraryCollapsed,
    handleToggleLibraryExpanded: panels.toggleLibraryExpanded,
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
