'use client'

import { useEffect, useRef, useState } from 'react'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'

export const usePlaylistActionMenus = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const viewMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        moreMenuRef.current?.contains(event.target as Node) ||
        viewMenuRef.current?.contains(event.target as Node)
      ) {
        return
      }

      setIsMoreOpen(false)
      setIsViewMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showApiSuccessToast('Link copied to clipboard')
      setIsMoreOpen(false)
    } catch (error) {
      showApiErrorToast(error, 'Failed to copy link')
    }
  }

  return {
    closeMoreMenu: () => setIsMoreOpen(false),
    copyLink,
    isMoreOpen,
    isViewMenuOpen,
    moreMenuRef,
    setIsViewMenuOpen,
    toggleMoreMenu: () => setIsMoreOpen((value) => !value),
    toggleViewMenu: () => setIsViewMenuOpen((value) => !value),
    viewMenuRef,
  }
}
