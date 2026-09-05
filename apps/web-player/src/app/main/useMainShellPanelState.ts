import { useState } from 'react'
import {
  LEFT_SIDEBAR_DEFAULT_SIZE,
  RIGHT_SIDEBAR_COLLAPSED_SIZE,
  RIGHT_SIDEBAR_DEFAULT_SIZE,
} from './mainShellResize.constants'

export const useMainShellPanelState = () => {
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false)
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false)
  const [leftSidebarSize, setLeftSidebarSize] = useState(
    LEFT_SIDEBAR_DEFAULT_SIZE,
  )
  const [rightSidebarSize, setRightSidebarSize] = useState(
    RIGHT_SIDEBAR_DEFAULT_SIZE,
  )

  const collapseRightSidebar = () => {
    setRightSidebarSize(RIGHT_SIDEBAR_COLLAPSED_SIZE)
    setIsRightSidebarCollapsed(true)
  }

  const expandRightSidebar = () => {
    setRightSidebarSize(RIGHT_SIDEBAR_DEFAULT_SIZE)
    setIsRightSidebarCollapsed(false)
  }

  const toggleLibraryExpanded = () => {
    setIsLibraryExpanded((currentValue) => {
      const nextValue = !currentValue
      setIsLibraryCollapsed(false)
      if (!nextValue) setLeftSidebarSize(LEFT_SIDEBAR_DEFAULT_SIZE)
      return nextValue
    })
  }

  const toggleLibraryCollapsed = () => {
    setIsLibraryCollapsed((currentValue) => {
      const nextValue = !currentValue
      if (nextValue) {
        setIsLibraryExpanded(false)
      } else {
        setLeftSidebarSize(LEFT_SIDEBAR_DEFAULT_SIZE)
      }
      return nextValue
    })
  }

  return {
    collapseRightSidebar,
    expandRightSidebar,
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
    toggleLibraryCollapsed,
    toggleLibraryExpanded,
  }
}
