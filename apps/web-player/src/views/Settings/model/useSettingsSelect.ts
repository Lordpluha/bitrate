import {
  type KeyboardEvent,
  type RefObject,
  useId,
  useRef,
  useState,
} from 'react'

type UseSettingsSelectOptions = {
  optionCount: number
  selectedIndex: number
}

export const useSettingsSelect = ({
  optionCount,
  selectedIndex,
}: UseSettingsSelectOptions) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(selectedIndex)
  const listboxId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const focusOption = (index: number) => {
    const nextIndex = (index + optionCount) % optionCount
    setActiveIndex(nextIndex)
    requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus())
  }

  const openAt = (index: number) => {
    setIsOpen(true)
    focusOption(index)
  }

  const close = (restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openAt(event.key === 'ArrowDown' ? selectedIndex : selectedIndex - 1)
    }
  }

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
      return
    }

    const navigationIndex =
      event.key === 'ArrowDown'
        ? activeIndex + 1
        : event.key === 'ArrowUp'
          ? activeIndex - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? optionCount - 1
              : null

    if (navigationIndex !== null) {
      event.preventDefault()
      focusOption(navigationIndex)
    }
  }

  return {
    activeIndex,
    close,
    handleListboxKeyDown,
    handleTriggerKeyDown,
    isOpen,
    listboxId,
    openAt,
    optionRefs,
    setIsOpen,
    triggerRef,
  } satisfies {
    activeIndex: number
    close: (restoreFocus?: boolean) => void
    handleListboxKeyDown: typeof handleListboxKeyDown
    handleTriggerKeyDown: typeof handleTriggerKeyDown
    isOpen: boolean
    listboxId: string
    openAt: (index: number) => void
    optionRefs: RefObject<Array<HTMLButtonElement | null>>
    setIsOpen: (isOpen: boolean) => void
    triggerRef: RefObject<HTMLButtonElement | null>
  }
}
