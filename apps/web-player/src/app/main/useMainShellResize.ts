'use client'

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { useEffect, useRef, useState } from 'react'

const LEFT_SIDEBAR_DEFAULT_SIZE = 22
const LEFT_SIDEBAR_EXPANDED_SIZE = 100
const LEFT_SIDEBAR_COLLAPSED_SIZE = '88px'
const LEFT_SIDEBAR_MIN_SIZE = 10
const LEFT_SIDEBAR_DRAG_MAX_SIZE = 30
const MAIN_CONTENT_MIN_SIZE = 24
const RIGHT_SIDEBAR_DEFAULT_SIZE = 20
const RIGHT_SIDEBAR_COLLAPSED_SIZE = 4
const RIGHT_SIDEBAR_MIN_SIZE = 16
const RIGHT_SIDEBAR_MAX_SIZE = 30
const RESIZE_HANDLE_SIZE = '8px'
const KEYBOARD_RESIZE_STEP = 1

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

interface UseMainShellResizeParams {
  hasRightSidebar: boolean
}

export const useMainShellResize = ({
  hasRightSidebar,
}: UseMainShellResizeParams) => {
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
  const resizeCleanupRef = useRef<() => void>(() => undefined)
  const activeRightSidebarSize = hasRightSidebar ? rightSidebarSize : 0

  useEffect(
    () => () => {
      resizeCleanupRef.current()
    },
    [],
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

  const handleStartLeftResize = (event: ReactPointerEvent<HTMLHRElement>) => {
    event.preventDefault()
    resizeCleanupRef.current()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsLibraryExpanded(false)
    setIsLibraryCollapsed(false)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rect = shellRef.current?.getBoundingClientRect()
      if (!rect) return

      const rawSize = ((moveEvent.clientX - rect.left) / rect.width) * 100
      const maxSize = Math.min(
        LEFT_SIDEBAR_DRAG_MAX_SIZE,
        100 - activeRightSidebarSize - MAIN_CONTENT_MIN_SIZE,
      )

      setLeftSidebarSize(clamp(rawSize, LEFT_SIDEBAR_MIN_SIZE, maxSize))
    }

    const handlePointerEnd = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      resizeCleanupRef.current = () => undefined
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd, { once: true })
    window.addEventListener('pointercancel', handlePointerEnd, { once: true })
    resizeCleanupRef.current = handlePointerEnd
  }

  const handleStartRightResize = (event: ReactPointerEvent<HTMLHRElement>) => {
    if (isRightSidebarCollapsed) return

    event.preventDefault()
    resizeCleanupRef.current()
    event.currentTarget.setPointerCapture(event.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rect = shellRef.current?.getBoundingClientRect()
      if (!rect) return

      const rawSize = ((rect.right - moveEvent.clientX) / rect.width) * 100
      const availableMainSpace = isLibraryExpanded
        ? LEFT_SIDEBAR_MIN_SIZE
        : leftSidebarSize + MAIN_CONTENT_MIN_SIZE
      const maxSize = Math.min(RIGHT_SIDEBAR_MAX_SIZE, 100 - availableMainSpace)
      const nextSize = clamp(rawSize, RIGHT_SIDEBAR_MIN_SIZE, maxSize)

      setRightSidebarSize(nextSize)
      setIsRightSidebarCollapsed(nextSize <= RIGHT_SIDEBAR_COLLAPSED_SIZE)
    }

    const handlePointerEnd = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      resizeCleanupRef.current = () => undefined
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd, { once: true })
    window.addEventListener('pointercancel', handlePointerEnd, { once: true })
    resizeCleanupRef.current = handlePointerEnd
  }

  const handleLeftResizeKeyDown = (
    event: ReactKeyboardEvent<HTMLHRElement>,
  ) => {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return
    }

    event.preventDefault()
    setIsLibraryExpanded(false)
    setIsLibraryCollapsed(false)

    const maxSize = Math.min(
      LEFT_SIDEBAR_DRAG_MAX_SIZE,
      100 - activeRightSidebarSize - MAIN_CONTENT_MIN_SIZE,
    )
    if (event.key === 'Home' || event.key === 'End') {
      setLeftSidebarSize(event.key === 'Home' ? LEFT_SIDEBAR_MIN_SIZE : maxSize)
      return
    }

    setLeftSidebarSize((currentSize) =>
      clamp(
        currentSize +
          (event.key === 'ArrowRight' ? 1 : -1) * KEYBOARD_RESIZE_STEP,
        LEFT_SIDEBAR_MIN_SIZE,
        maxSize,
      ),
    )
  }

  const handleRightResizeKeyDown = (
    event: ReactKeyboardEvent<HTMLHRElement>,
  ) => {
    if (
      isRightSidebarCollapsed ||
      (event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Home' &&
        event.key !== 'End')
    ) {
      return
    }

    event.preventDefault()
    const availableMainSpace = isLibraryExpanded
      ? LEFT_SIDEBAR_MIN_SIZE
      : leftSidebarSize + MAIN_CONTENT_MIN_SIZE
    const maxSize = Math.min(RIGHT_SIDEBAR_MAX_SIZE, 100 - availableMainSpace)
    if (event.key === 'Home' || event.key === 'End') {
      setRightSidebarSize(
        event.key === 'Home' ? RIGHT_SIDEBAR_MIN_SIZE : maxSize,
      )
      return
    }

    setRightSidebarSize((currentSize) =>
      clamp(
        currentSize +
          (event.key === 'ArrowLeft' ? 1 : -1) * KEYBOARD_RESIZE_STEP,
        RIGHT_SIDEBAR_MIN_SIZE,
        maxSize,
      ),
    )
  }

  const gridTemplateColumns = isLibraryCollapsed
    ? hasRightSidebar
      ? `${LEFT_SIDEBAR_COLLAPSED_SIZE} ${RESIZE_HANDLE_SIZE} minmax(0, 1fr) ${RESIZE_HANDLE_SIZE} ${rightSidebarSize}%`
      : `${LEFT_SIDEBAR_COLLAPSED_SIZE} ${RESIZE_HANDLE_SIZE} minmax(0, 1fr)`
    : isLibraryExpanded
      ? hasRightSidebar
        ? `minmax(0, 1fr) ${RESIZE_HANDLE_SIZE} 0 ${RESIZE_HANDLE_SIZE} ${rightSidebarSize}%`
        : `minmax(0, 1fr) ${RESIZE_HANDLE_SIZE} 0`
      : hasRightSidebar
        ? `${leftSidebarSize}% ${RESIZE_HANDLE_SIZE} minmax(0, 1fr) ${RESIZE_HANDLE_SIZE} ${rightSidebarSize}%`
        : `${leftSidebarSize}% ${RESIZE_HANDLE_SIZE} minmax(0, 1fr)`

  return {
    gridTemplateColumns,
    handleCollapseRightSidebar,
    handleExpandRightSidebar,
    handleLeftResizeKeyDown,
    handleRightResizeKeyDown,
    handleStartLeftResize,
    handleStartRightResize,
    handleToggleLibraryCollapsed,
    handleToggleLibraryExpanded,
    isLibraryCollapsed,
    isLibraryExpanded,
    isRightSidebarCollapsed,
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
    shellRef,
  }
}
