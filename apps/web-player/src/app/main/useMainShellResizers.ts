'use client'

import type { RefObject } from 'react'
import { useHorizontalResize } from '@/shared/hooks'
import {
  LEFT_SIDEBAR_MIN_SIZE,
  RIGHT_SIDEBAR_COLLAPSED_SIZE,
  RIGHT_SIDEBAR_MIN_SIZE,
} from './mainShellResize.constants'
import { clamp } from './mainShellResize.utils'

type MainShellResizersParams = {
  isRightSidebarCollapsed: boolean
  leftSidebarMaxSize: number
  leftSidebarSize: number
  rightSidebarMaxSize: number
  rightSidebarSize: number
  setIsLibraryCollapsed: (value: boolean) => void
  setIsLibraryExpanded: (value: boolean) => void
  setIsRightSidebarCollapsed: (value: boolean) => void
  setLeftSidebarSize: (value: number) => void
  setRightSidebarSize: (value: number) => void
  shellRef: RefObject<HTMLDivElement | null>
}

export const useMainShellResizers = ({
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
}: MainShellResizersParams) => {
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

  return { leftResize, rightResize }
}
