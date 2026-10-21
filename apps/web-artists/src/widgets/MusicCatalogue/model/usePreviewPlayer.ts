import type { MusicTrack } from '@entities/music'
import { useEffect, useRef, useState } from 'react'

/** One shared preview `<audio>`: plays, pauses and reports failures for the chosen track. */
export function usePreviewPlayer() {
  const [active, setActive] = useState<MusicTrack | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let current = true
    if (playing && active?.previewUrl) {
      void audio.play().catch(() => {
        if (!current) return
        setPlaying(false)
        setPlayError('Preview could not be played. Please try again.')
      })
    } else audio.pause()
    return () => {
      current = false
      audio.pause()
    }
  }, [playing, active])

  /** Starts the track, or pauses it when it is the one already playing. */
  const toggle = (track: MusicTrack) => {
    setPlayError(null)
    setActive(track)
    setPlaying(active?.id === track.id ? !playing : true)
  }
  const stop = () => setPlaying(false)
  const fail = () => {
    setPlaying(false)
    setPlayError('Preview is unavailable.')
  }

  return { active, playing, playError, audioRef, toggle, stop, fail }
}
