'use client'

import { useEffect, useRef, useState } from 'react'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useI18n } from '@/shared/i18n'

export const usePlaylistActionMenus = () => {
  const { t } = useI18n()
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
      showApiSuccessToast(t('playlist.linkCopied'))
      setIsMoreOpen(false)
    } catch (error) {
      showApiErrorToast(error, t('playlist.copyFailed'))
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
