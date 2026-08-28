'use client'

import type { FC } from 'react'
import { usePlayerController } from '@/widgets/Player/model/usePlayerController'
import { DesktopPlayerBar } from './DesktopPlayerBar'
import { PlayerAudioElements } from './PlayerAudioElements'
import { PlayerResponsiveViews } from './PlayerResponsiveViews'

interface PlayerProps {
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}

export const Player: FC<PlayerProps> = ({ isExpanded, onExpandedChange }) => {
  const controller = usePlayerController({ isExpanded, onExpandedChange })

  if (!controller) return null

  return (
    <>
      <PlayerAudioElements {...controller.audioProps} />
      <PlayerResponsiveViews {...controller.responsiveProps} />
      <DesktopPlayerBar {...controller.desktopProps} />
    </>
  )
}
