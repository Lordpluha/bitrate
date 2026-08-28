'use client'

import type { SlotIndex } from '@entities/Player'

type PlayerAudioElementsProps = {
  activeSlot: SlotIndex
  bindAudioElement: (slot: SlotIndex, element: HTMLAudioElement | null) => void
  onCanPlay: (slot: SlotIndex) => void
  onEnded: (slot: SlotIndex) => void
  onLoadedMetadata: (slot: SlotIndex) => void
  onPlaybackStateChange: (slot: SlotIndex, isPlaying: boolean) => void
  onProgress: (slot: SlotIndex) => void
  onSeeked: () => void
  onTimeUpdate: (slot: SlotIndex) => void
}

export const PlayerAudioElements = ({
  activeSlot,
  bindAudioElement,
  onCanPlay,
  onEnded,
  onLoadedMetadata,
  onPlaybackStateChange,
  onProgress,
  onSeeked,
  onTimeUpdate,
}: PlayerAudioElementsProps) =>
  ([0, 1] as const).map((slot) => (
    // biome-ignore lint/a11y/useMediaCaption: this element plays audio-only music
    <audio
      data-active={activeSlot === slot}
      key={slot}
      onCanPlay={() => onCanPlay(slot)}
      onEnded={() => onEnded(slot)}
      onLoadedMetadata={() => onLoadedMetadata(slot)}
      onPause={() => onPlaybackStateChange(slot, false)}
      onPlay={() => onPlaybackStateChange(slot, true)}
      onProgress={() => onProgress(slot)}
      onSeeked={onSeeked}
      onTimeUpdate={() => onTimeUpdate(slot)}
      preload="auto"
      ref={(element) => bindAudioElement(slot, element)}
    />
  ))
