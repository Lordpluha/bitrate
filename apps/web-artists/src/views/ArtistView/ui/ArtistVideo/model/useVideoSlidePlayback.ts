import { useCallback, useEffect, useRef, useState } from 'react'

type UseVideoSlidePlaybackParams = {
  slideIndex: number
  videoSrc: string
  isCarouselScrolling: boolean
  onRequestCenter: (index: number) => void
  centeredSlideIndex: number
  centerPlaySignal: number
  canHover: boolean
  isLgUp: boolean
}

export const useVideoSlidePlayback = ({
  slideIndex,
  videoSrc,
  isCarouselScrolling,
  onRequestCenter,
  centeredSlideIndex,
  centerPlaySignal,
  canHover,
  isLgUp,
}: UseVideoSlidePlaybackParams) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPaused, setIsPaused] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isActivated, setIsActivated] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isCenterPlayRequested, setIsCenterPlayRequested] = useState(false)
  const [isManuallyPaused, setIsManuallyPaused] = useState(false)
  const lastHandledCenterSignalRef = useRef(0)

  const hasVideo = Boolean(videoSrc)
  const isCenteredSlide = centeredSlideIndex === slideIndex
  const isCenteredPlaying = isCenteredSlide && isActivated && !isPaused
  const shouldHidePoster = isActivated && !isPaused
  const isAwaitingPlaybackStart = isPaused && (isCenterPlayRequested || (isLgUp ? isHovered : isCenteredSlide))
  const shouldShowLoader = hasVideo
    && isActivated
    && !isManuallyPaused
    && (isVideoLoading || isAwaitingPlaybackStart)

  const activateVideo = useCallback(() => {
    setIsVideoLoading(!isVideoReady)
    setIsManuallyPaused(false)
    setIsActivated(true)
  }, [isVideoReady])

  const clearCenterRequestAndManualPause = useCallback(() => {
    setIsCenterPlayRequested(false)
    setIsManuallyPaused(false)
  }, [])

  const pauseVideo = useCallback(() => {
    const video = videoRef.current
    if (video) {
      video.pause()
    }

    setIsPaused(true)
  }, [])

  const resetPlaybackState = useCallback(({ deactivate, resetLoading }: { deactivate: boolean; resetLoading: boolean }) => {
    if (resetLoading) {
      setIsVideoLoading(false)
    }

    if (deactivate) {
      setIsActivated(false)
    }

    clearCenterRequestAndManualPause()
    pauseVideo()
  }, [clearCenterRequestAndManualPause, pauseVideo])

  const playVideo = useCallback(({ clearCenterRequest, clearCenterRequestOnFail }: { clearCenterRequest: boolean; clearCenterRequestOnFail: boolean }) => {
    const video = videoRef.current
    if (!video) return false

    video.muted = isMuted
    const playPromise = video.play()
    if (playPromise) {
      void playPromise.catch(() => {
        setIsPaused(true)

        if (clearCenterRequestOnFail) {
          setIsCenterPlayRequested(false)
        }
      })
    }

    setIsPaused(false)

    if (clearCenterRequest) {
      setIsCenterPlayRequested(false)
    }

    return true
  }, [isMuted])

  useEffect(() => {
    if (centeredSlideIndex !== slideIndex) {
      setIsCenterPlayRequested(false)
      return
    }

    if (centerPlaySignal === lastHandledCenterSignalRef.current) return

    lastHandledCenterSignalRef.current = centerPlaySignal

    if (!hasVideo) return

    setIsCenterPlayRequested(true)
    setIsManuallyPaused(false)
    setIsActivated(true)
    setIsVideoLoading(!isVideoReady)
  }, [centeredSlideIndex, slideIndex, centerPlaySignal, hasVideo, isVideoReady])

  useEffect(() => {
    if (!isActivated || isCarouselScrolling) return
    if (isManuallyPaused) return

    const canAutoPlay = isLgUp ? (isHovered || isCenterPlayRequested) : isCenteredSlide
    if (!canAutoPlay) return

    playVideo({ clearCenterRequest: true, clearCenterRequestOnFail: true })
  }, [isActivated, isCarouselScrolling, isCenteredSlide, isCenterPlayRequested, isHovered, isLgUp, isManuallyPaused, playVideo])

  useEffect(() => {
    if (isLgUp) return
    if (isCenteredSlide) return

    resetPlaybackState({ deactivate: true, resetLoading: false })
  }, [isCenteredSlide, isLgUp, resetPlaybackState])

  useEffect(() => {
    if (!isCarouselScrolling) return

    resetPlaybackState({ deactivate: false, resetLoading: false })
  }, [isCarouselScrolling, resetPlaybackState])

  const handleMouseEnter = useCallback(() => {
    if (!isLgUp) return
    if (isDragging) return

    clearCenterRequestAndManualPause()
    setIsHovered(true)

    if (!hasVideo) return

    if (!isActivated) {
      activateVideo()
      return
    }

    playVideo({ clearCenterRequest: false, clearCenterRequestOnFail: false })
  }, [isLgUp, isDragging, clearCenterRequestAndManualPause, hasVideo, isActivated, activateVideo, playVideo])

  const handleMouseLeave = useCallback(() => {
    if (!isLgUp) return

    setIsHovered(false)

    resetPlaybackState({ deactivate: true, resetLoading: true })
  }, [isLgUp, resetPlaybackState])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      if (hasVideo) {
        activateVideo()
      }
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

  const handleCardTap = useCallback(() => {
    if (isDragging || !hasVideo) return

    if (isLgUp) {
      toggleMuted()
      return
    }

    if (canHover) return

    clearCenterRequestAndManualPause()
    onRequestCenter(slideIndex)

    if (!isActivated) {
      activateVideo()
      return
    }

    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      void video.play()
      setIsPaused(false)
      setIsManuallyPaused(false)
    }
  }, [isDragging, hasVideo, isLgUp, toggleMuted, canHover, clearCenterRequestAndManualPause, onRequestCenter, slideIndex, isActivated, activateVideo])

  return {
    videoRef,
    hasVideo,
    isPaused,
    isMuted,
    isActivated,
    isVideoLoading,
    isVideoReady,
    isCenteredSlide,
    isCenteredPlaying,
    shouldHidePoster,
    shouldShowLoader,
    handleMouseEnter,
    handleMouseLeave,
    handleCardTap,
    togglePlay,
    toggleMuted,
    setIsDragging,
    setIsVideoReady,
    setIsVideoLoading,
    setIsPaused,
  }
}
