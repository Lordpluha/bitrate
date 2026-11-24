import { useProgress } from 'react-native-track-player'

export type EngineProgress = {
  positionSec: number
  durationSec: number
}

const UPDATE_INTERVAL_MS = 500

/** Playback position from the native player, polled twice a second while mounted. */
export function useEngineProgress(): EngineProgress {
  const { position, duration } = useProgress(UPDATE_INTERVAL_MS)
  return { positionSec: position, durationSec: duration }
}
