'use client'

import type { BitratePlayerElement } from '@bitrate/player/contract'
import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'
import { usePlayerElementStore } from '@/entities/Player/model/playerElementStore'

type PlayerMirrorProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

/**
 * A `<bitrate-player>` that plays nothing itself and mirrors the playing element: the parts
 * inside it read and drive that element's playback. Its layout is the host's own — the class
 * and style here lay out the parts and React controls placed inside.
 */
export const PlayerMirror = ({
  children,
  className,
  style,
}: PlayerMirrorProps) => {
  const primary = usePlayerElementStore((state) => state.element)
  const [mirror, setMirror] = useState<BitratePlayerElement | null>(null)

  useEffect(() => {
    if (mirror) mirror.mirror = primary
  }, [mirror, primary])

  return (
    <bitrate-player
      chrome="none"
      className={className}
      ref={setMirror}
      style={style}
    >
      {children}
    </bitrate-player>
  )
}
