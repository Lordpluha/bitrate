'use client'

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { useRef, useState } from 'react'

type KeyboardResizeConfig = {
  increaseKey: 'ArrowLeft' | 'ArrowRight'
  max: number
  min: number
  onResize: (value: number) => void
  step?: number
  value: number
}

type UseHorizontalResizeParams = {
  disabled?: boolean
  keyboard: KeyboardResizeConfig
  onResize: (clientX: number) => void
  onResizeStart?: () => void
}

export const useHorizontalResize = ({
  disabled = false,
  keyboard,
  onResize,
  onResizeStart,
}: UseHorizontalResizeParams) => {
  const activePointerIdRef = useRef<number | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  const finishResize = (event: ReactPointerEvent<HTMLElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    activePointerIdRef.current = null
    setIsResizing(false)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (disabled) return

    event.preventDefault()
    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsResizing(true)
    onResizeStart?.()
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return
    onResize(event.clientX)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const isArrowKey = event.key === 'ArrowLeft' || event.key === 'ArrowRight'
    const isBoundaryKey = event.key === 'Home' || event.key === 'End'

    if (disabled || (!isArrowKey && !isBoundaryKey)) return

    event.preventDefault()
    onResizeStart?.()

    if (event.key === 'Home' || event.key === 'End') {
      keyboard.onResize(event.key === 'Home' ? keyboard.min : keyboard.max)
      return
    }

    const direction = event.key === keyboard.increaseKey ? 1 : -1
    const nextValue = keyboard.value + direction * (keyboard.step ?? 1)
    keyboard.onResize(Math.min(Math.max(nextValue, keyboard.min), keyboard.max))
  }

  return {
    isResizing,
    resizeHandleProps: {
      onKeyDown: handleKeyDown,
      onLostPointerCapture: finishResize,
      onPointerCancel: finishResize,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishResize,
    },
  }
}
