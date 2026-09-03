'use client'

import type { ApiSchemas } from '@bitrate/contracts'
import { cn } from '@bitrate/ui-react'
import { usePlayerStore } from '@entities/Player/model/playerStore'
import { showApiSuccessToast } from '@shared/api/feedback'
import { ListPlus } from 'lucide-react'

export type AddToQueueButtonProps = {
  className?: string
  track: ApiSchemas['TrackEntity']
}

/** Appends a track to the user queue, played after the current one. */
export const AddToQueueButton = ({
  className,
  track,
}: AddToQueueButtonProps) => {
  const addToQueue = usePlayerStore((state) => state.addToQueue)

  return (
    <button
      aria-label={`Add ${track.title} to queue`}
      className={cn(
        'rounded-full p-1 text-text-subdued transition-colors hover:bg-white/10 hover:text-text',
        className,
      )}
      onClick={(event) => {
        event.stopPropagation()
        addToQueue(track)
        showApiSuccessToast('Added to queue')
      }}
      type="button"
    >
      <ListPlus size={16} />
    </button>
  )
}
