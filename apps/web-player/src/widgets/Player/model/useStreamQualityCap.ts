'use client'

import { useEffect } from 'react'
import { setMaxStreamBitrate } from '@/entities/Player'
import { maxBitrateForQuality, useSettingsStore } from '@/entities/Settings'

/** Mirrors the audio-quality setting into the player; the next track honours it. */
export const useStreamQualityCap = () => {
  const quality = useSettingsStore((state) => state.streamingQuality)

  useEffect(() => {
    setMaxStreamBitrate(maxBitrateForQuality(quality))
  }, [quality])
}
