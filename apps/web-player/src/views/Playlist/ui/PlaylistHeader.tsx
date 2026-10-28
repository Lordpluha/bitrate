'use client'

import { useI18n } from '@shared/i18n'
import { CollectionHeader } from '@shared/ui/CollectionHeader'
import { formatTotalDuration } from '@shared/utils/TimeUtils'

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
}: PlaylistHeaderProps) => {
  const { t, tp } = useI18n()

  return (
    <CollectionHeader
      coverUrl={imageUrl}
      meta={[
        tp({ count: tracksCount, key: 'common.songs' }),
        ...(duration > 0 ? [formatTotalDuration({ duration, t })] : []),
      ]}
      owner={author}
      title={title}
      type={type}
    />
  )
}
