'use client'

import { type RefObject, useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type UseOverlayFocusOptions = {
  isOpen: boolean
  onClose: () => void
}

/** Keeps keyboard focus inside a modal overlay and restores it after closing. */
export const useOverlayFocus = <TElement extends HTMLElement>({
  isOpen,
  onClose,
}: UseOverlayFocusOptions): RefObject<TElement | null> => {
  const overlayRef = useRef<TElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    const overlay = overlayRef.current

    document.body.style.overflow = 'hidden'
    overlay?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !overlay) return

      const focusableElements = Array.from(
        overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      )
      const first = focusableElements.at(0)
      const last = focusableElements.at(-1)

      if (!first || !last) {
        event.preventDefault()
        overlay.focus()
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [isOpen])

  return overlayRef
}
