'use client'

import { usePlayerElementStore } from '@entities/Player'
import { useEffect } from 'react'
import { useFloatingPlayerStyles } from '@/widgets/Player/model/useFloatingPlayerStyles'

interface FloatingPlayerWindowProps {
  targetWindow: Window | null
}

/** The floating layout's colours in the app's tokens, copied into the window with the styles. */
const FLOATING_THEME = {
  '--bitrate-player-accent': 'var(--color-primary)',
  '--bitrate-player-play-background': 'var(--color-primary)',
  '--bitrate-player-play-foreground': 'var(--color-primary-foreground)',
  '--bitrate-player-radius': '0',
} as const

/**
 * The picture-in-picture window: a `<bitrate-player chrome="floating">` mirroring the playing
 * element. It is created here, where the element is registered, and then moved into the
 * window — React would create it with the window's own document, whose registry has no
 * player, so the element is managed by hand rather than portalled.
 */
export const FloatingPlayerWindow = ({
  targetWindow,
}: FloatingPlayerWindowProps) => {
  const primary = usePlayerElementStore((state) => state.element)
  useFloatingPlayerStyles(targetWindow)

  useEffect(() => {
    if (!targetWindow || targetWindow.closed || !primary) return

    const mirror = document.createElement('bitrate-player')
    mirror.chrome = 'floating'
    mirror.mirror = primary
    mirror.style.display = 'block'
    mirror.style.height = '100vh'
    /** The app font is set on the main `<body>`, which the window's copied styles do not reach. */
    mirror.style.fontFamily = getComputedStyle(document.body).fontFamily
    for (const [property, value] of Object.entries(FLOATING_THEME)) {
      mirror.style.setProperty(property, value)
    }

    const { body } = targetWindow.document
    body.style.margin = '0'
    body.append(mirror)
    return () => mirror.remove()
  }, [primary, targetWindow])

  return null
}
