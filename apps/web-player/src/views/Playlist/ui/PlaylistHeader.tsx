'use client'

import { CollectionHeader } from '@shared/ui/CollectionHeader'
import { TimeUtils } from '@shared/utils/TimeUtils'

interface PlaylistHeaderProps {
  title: string
  type: string
  imageUrl: string
  author: string
  tracksCount: number
  duration: number
}

export const PlaylistHeader = ({
  title,
  type,
  imageUrl,
  author,
  tracksCount,
  duration,
}: PlaylistHeaderProps) => (
  <CollectionHeader
    coverUrl={imageUrl}
    meta={[
      `${tracksCount} ${tracksCount === 1 ? 'song' : 'songs'}`,
      ...(duration > 0 ? [TimeUtils.formatDuration(duration)] : []),
    ]}
    owner={author}
    title={title}
    type={type}
  />
)
