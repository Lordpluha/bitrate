import { useCallback, useEffect, useRef, useState } from 'react'
import { useVideoElement } from './useVideoElement'

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

/**
 * Decides when one carousel slide's video plays.
 *
 * On wide screens playback follows the pointer; on narrow ones it follows the
 * centred slide. Element-level playback itself lives in `useVideoElement`.
 */
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
  const hasVideo = Boolean(videoSrc)
  const video = useVideoElement({ hasVideo })
  const {
    activateVideo,
    clearCenterRequestAndManualPause,
    isActivated,
    isCenterPlayRequested,
    isManuallyPaused,
    isPaused,
    isVideoLoading,
    playVideo,
    requestCenterPlay,
    resetPlaybackState,
    resumeIfPaused,
    setIsCenterPlayRequested,
    toggleMuted,
  } = video

  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const lastHandledCenterSignalRef = useRef(0)

  const isCenteredSlide = centeredSlideIndex === slideIndex
  const isCenteredPlaying = isCenteredSlide && isActivated && !isPaused
  const shouldHidePoster = isActivated && !isPaused
  const isAwaitingPlaybackStart =
    isPaused &&
    (isCenterPlayRequested || (isLgUp ? isHovered : isCenteredSlide))
  const shouldShowLoader =
    hasVideo &&
    isActivated &&
    !isManuallyPaused &&
    (isVideoLoading || isAwaitingPlaybackStart)

  useEffect(() => {
    if (centeredSlideIndex !== slideIndex) {
      setIsCenterPlayRequested(false)
      return
    }
    if (centerPlaySignal === lastHandledCenterSignalRef.current) return

    lastHandledCenterSignalRef.current = centerPlaySignal
    if (!hasVideo) return

    requestCenterPlay()
  }, [
    centeredSlideIndex,
    slideIndex,
    centerPlaySignal,
    hasVideo,
    requestCenterPlay,
    setIsCenterPlayRequested,
  ])

  useEffect(() => {
    if (!isActivated || isCarouselScrolling) return
    if (isManuallyPaused) return

    const canAutoPlay = isLgUp
      ? isHovered || isCenterPlayRequested
      : isCenteredSlide
    if (!canAutoPlay) return

    playVideo({ clearCenterRequest: true, clearCenterRequestOnFail: true })
  }, [
    isActivated,
    isCarouselScrolling,
    isCenteredSlide,
    isCenterPlayRequested,
    isHovered,
    isLgUp,
    isManuallyPaused,
    playVideo,
  ])

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
  }, [
    isLgUp,
    isDragging,
    clearCenterRequestAndManualPause,
    hasVideo,
    isActivated,
    activateVideo,
    playVideo,
  ])

  const handleMouseLeave = useCallback(() => {
    if (!isLgUp) return

    setIsHovered(false)
    resetPlaybackState({ deactivate: true, resetLoading: true })
  }, [isLgUp, resetPlaybackState])

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

    resumeIfPaused()
  }, [
    isDragging,
    hasVideo,
    isLgUp,
    toggleMuted,
    canHover,
    clearCenterRequestAndManualPause,
    onRequestCenter,
    slideIndex,
    isActivated,
    activateVideo,
    resumeIfPaused,
  ])

  return {
    videoRef: video.videoRef,
    hasVideo,
    isPaused,
    isMuted: video.isMuted,
    isActivated,
    isVideoLoading,
    isVideoReady: video.isVideoReady,
    isCenteredSlide,
    isCenteredPlaying,
    shouldHidePoster,
    shouldShowLoader,
    handleMouseEnter,
    handleMouseLeave,
    handleCardTap,
    togglePlay: video.togglePlay,
    toggleMuted,
    setIsDragging,
    setIsVideoReady: video.setIsVideoReady,
    setIsVideoLoading: video.setIsVideoLoading,
    setIsPaused: video.setIsPaused,
  }
}
