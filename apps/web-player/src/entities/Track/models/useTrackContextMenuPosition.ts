'use client'

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { useState } from 'react'
export type TrackContextMenuPosition = {
  left: number
  top: number
}

export const useTrackContextMenuPosition = () => {
  const [position, setPosition] = useState<TrackContextMenuPosition | null>(
    null,
  )

  const open = (left: number, top: number) => {
    setPosition({
      left: Math.max(8, Math.min(left, window.innerWidth - 232)),
      top: Math.max(8, Math.min(top, window.innerHeight - 152)),
    })
  }

  const openFromPointer = (event: ReactMouseEvent<HTMLFieldSetElement>) => {
    event.preventDefault()
    open(event.clientX, event.clientY)
  }

  const openFromKeyboard = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!(event.shiftKey && event.key === 'F10')) return

    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    open(rect.left + 24, rect.top + 24)
  }

  return {
    close: () => setPosition(null),
    openFromKeyboard,
    openFromPointer,
    position,
  }
}
