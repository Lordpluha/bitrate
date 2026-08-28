import { useCallback, useRef, useState } from 'react'

/** What the element hook needs from the slide around it. */
type UseVideoElementInput = {
  hasVideo: boolean
}

/** How a reset should treat activation and the loading indicator. */
type ResetPlaybackInput = {
  deactivate: boolean
  resetLoading: boolean
}

/** Whether a failed or successful play should clear the pending centre request. */
type PlayVideoInput = {
  clearCenterRequest: boolean
  clearCenterRequestOnFail: boolean
}

/**
 * Owns one `<video>` element and everything about its own playback state.
 *
 * Deliberately unaware of the carousel: the slide hook above decides *when* to
 * play, this only knows *how*.
 */
export const useVideoElement = ({ hasVideo }: UseVideoElementInput) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPaused, setIsPaused] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isActivated, setIsActivated] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isCenterPlayRequested, setIsCenterPlayRequested] = useState(false)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)

  const activateVideo = useCallback(() => {
    setIsVideoLoading(!isVideoReady)
    setIsManuallyPaused(false)
    setIsActivated(true)
  }, [isVideoReady])

  const clearCenterRequestAndManualPause = useCallback(() => {
    setIsCenterPlayRequested(false)
    setIsManuallyPaused(false)
  }, [])

  /** Marks this slide as the one the carousel asked to play when it centred. */
  const requestCenterPlay = useCallback(() => {
    setIsCenterPlayRequested(true)
    setIsManuallyPaused(false)
    setIsActivated(true)
    setIsVideoLoading(!isVideoReady)
  }, [isVideoReady])

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause()
    setIsPaused(true)
  }, [])

  const resetPlaybackState = useCallback(
    ({ deactivate, resetLoading }: ResetPlaybackInput) => {
      if (resetLoading) setIsVideoLoading(false)
      if (deactivate) setIsActivated(false)

      clearCenterRequestAndManualPause()
      pauseVideo()
    },
    [clearCenterRequestAndManualPause, pauseVideo],
  )

  const playVideo = useCallback(
    ({ clearCenterRequest, clearCenterRequestOnFail }: PlayVideoInput) => {
      const video = videoRef.current
      if (!video) return false

      video.muted = isMuted
      const playPromise = video.play()
      if (playPromise) {
        void playPromise.catch(() => {
          setIsPaused(true)
          if (clearCenterRequestOnFail) setIsCenterPlayRequested(false)
        })
      }

      setIsPaused(false)
      if (clearCenterRequest) setIsCenterPlayRequested(false)

      return true
    },
    [isMuted],
  )

  /** Resumes a paused element without touching activation state. */
  const resumeIfPaused = useCallback(() => {
    const video = videoRef.current
    if (!video?.paused) return

    void video.play()
    setIsPaused(false)
    setIsManuallyPaused(false)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      if (hasVideo) activateVideo()
      return
    }

    if (video.paused) {
      void video.play()
      setIsPaused(false)
      setIsManuallyPaused(false)
      return
    }

    video.pause()
    setIsPaused(true)
    setIsManuallyPaused(true)
  }, [hasVideo, activateVideo])

  const toggleMuted = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      setIsMuted((prev) => !prev)
      return
    }

    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  return {
    activateVideo,
    clearCenterRequestAndManualPause,
    isActivated,
    isCenterPlayRequested,
    isManuallyPaused,
    isMuted,
    isPaused,
    isVideoLoading,
    isVideoReady,
    playVideo,
    requestCenterPlay,
    resetPlaybackState,
    resumeIfPaused,
    setIsCenterPlayRequested,
    setIsPaused,
    setIsVideoLoading,
    setIsVideoReady,
    toggleMuted,
    togglePlay,
    videoRef,
  }
}
