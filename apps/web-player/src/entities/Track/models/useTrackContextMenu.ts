import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
} from 'react'

export const useTrackContextMenu = (onClose: () => void) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('pointerdown', onClose)
    window.addEventListener('blur', onClose)
    window.addEventListener('keydown', handleKeyDown)
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus()

    return () => {
      window.removeEventListener('pointerdown', onClose)
      window.removeEventListener('blur', onClose)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const runAction = (action: () => void) => {
    action()
    onClose()
  }

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ),
    )
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowDown'
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length

    items[nextIndex]?.focus()
  }

  return { handleMenuKeyDown, menuRef, runAction }
}
