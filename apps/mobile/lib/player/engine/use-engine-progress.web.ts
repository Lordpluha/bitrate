import { useEffect, useState } from 'react'

import { webAudio } from './web-audio'

export type EngineProgress = {
  positionSec: number
  durationSec: number
}

const read = (): EngineProgress => {
  const audio = webAudio()
  return { positionSec: audio.currentTime, durationSec: Number.isFinite(audio.duration) ? audio.duration : 0 }
}

/** Playback position from the shared `<audio>` element's `timeupdate` events. */
export function useEngineProgress(): EngineProgress {
  const [progress, setProgress] = useState(read)

  useEffect(() => {
    const audio = webAudio()
    const update = () => setProgress(read())
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('durationchange', update)
    return () => {
      audio.removeEventListener('timeupdate', update)
      audio.removeEventListener('durationchange', update)
    }
  }, [])

  return progress
}
