'use client'

import { defineBitratePlayer } from '@bitrate/player'
import type { BitratePlayerElement } from '@bitrate/player/contract'
import { useEffect, useState } from 'react'

type PlayerElementProps = {
  bindElement: (element: BitratePlayerElement | null) => void
}

/**
 * The one `<bitrate-player>` that plays — headless (`chrome="none"`); the visible surfaces
 * render around it. Mounted only once the tag is defined, because properties set on an element
 * before it upgrades are not guaranteed to survive.
 */
export const PlayerElement = ({ bindElement }: PlayerElementProps) => {
  const [defined, setDefined] = useState(false)

  useEffect(() => {
    let mounted = true
    void defineBitratePlayer().then(() => {
      if (mounted) setDefined(true)
    })
    return () => {
      mounted = false
    }
  }, [])

  if (!defined) return null
  /**
   * Out of layout: an empty block still takes a flex gap in the app shell. `display: none` on
   * the tag itself, since the element's own `:host { display: block }` would beat `hidden`;
   * its media keep playing inside a hidden subtree.
   */
  return (
    <bitrate-player
      chrome="none"
      ref={bindElement}
      style={{ display: 'none' }}
    />
  )
}
