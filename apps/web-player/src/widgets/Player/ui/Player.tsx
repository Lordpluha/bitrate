'use client'

import type { FC } from 'react'
import { usePlayerController } from '@/widgets/Player/model/usePlayerController'
import { DesktopPlayerBar } from './DesktopPlayerBar'
import { PlayerElement } from './PlayerElement'
import { PlayerResponsiveViews } from './PlayerResponsiveViews'
import { TrackAnnouncer } from './TrackAnnouncer'

interface PlayerProps {
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}

export const Player: FC<PlayerProps> = ({ isExpanded, onExpandedChange }) => {
  const controller = usePlayerController({ isExpanded, onExpandedChange })

  if (!controller) return null

  return (
    <>
      <PlayerElement {...controller.elementProps} />
      <TrackAnnouncer title={controller.desktopProps.title} />
      <PlayerResponsiveViews {...controller.responsiveProps} />
      <DesktopPlayerBar {...controller.desktopProps} />
    </>
  )
}
