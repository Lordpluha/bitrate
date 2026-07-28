import {
  LEFT_SIDEBAR_COLLAPSED_SIZE,
  LEFT_SIDEBAR_DRAG_MAX_SIZE,
  LEFT_SIDEBAR_MIN_SIZE,
  MAIN_CONTENT_MIN_SIZE,
  RESIZE_HANDLE_SIZE,
  RIGHT_SIDEBAR_MAX_SIZE,
} from '@/app/main/mainShellResize.constants'

type MainShellGridParams = {
  hasRightSidebar: boolean
  isLibraryCollapsed: boolean
  isLibraryExpanded: boolean
  leftSidebarSize: number
  rightSidebarSize: number
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const getLeftSidebarMaxSize = (rightSidebarSize: number) =>
  Math.min(
    LEFT_SIDEBAR_DRAG_MAX_SIZE,
    100 - rightSidebarSize - MAIN_CONTENT_MIN_SIZE,
  )

export const getRightSidebarMaxSize = (
  isLibraryExpanded: boolean,
  leftSidebarSize: number,
) => {
  const occupiedSpace = isLibraryExpanded
    ? LEFT_SIDEBAR_MIN_SIZE
    : leftSidebarSize + MAIN_CONTENT_MIN_SIZE

  return Math.min(RIGHT_SIDEBAR_MAX_SIZE, 100 - occupiedSpace)
}

export const getMainShellGridTemplate = ({
  hasRightSidebar,
  isLibraryCollapsed,
  isLibraryExpanded,
  leftSidebarSize,
  rightSidebarSize,
}: MainShellGridParams) => {
  const rightSidebarColumns = hasRightSidebar
    ? ` ${RESIZE_HANDLE_SIZE} ${rightSidebarSize}%`
    : ''

  if (isLibraryCollapsed) {
    return `${LEFT_SIDEBAR_COLLAPSED_SIZE} ${RESIZE_HANDLE_SIZE} minmax(0, 1fr)${rightSidebarColumns}`
  }

  if (isLibraryExpanded) {
    return `minmax(0, 1fr) ${RESIZE_HANDLE_SIZE} 0${rightSidebarColumns}`
  }

  return `${leftSidebarSize}% ${RESIZE_HANDLE_SIZE} minmax(0, 1fr)${rightSidebarColumns}`
}
