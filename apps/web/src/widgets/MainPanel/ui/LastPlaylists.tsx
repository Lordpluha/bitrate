import React from 'react'
import type { ApiSchemas } from '@spotify/contracts'
import { MusicCardMd } from './MusicCardMd'

type LastPlaylistItem = ApiSchemas['PlaylistEntity']

interface LastPlaylistsProps {
  items: LastPlaylistItem[]
  onPlaylistClick?: (id: string) => void
}

export const LastPlaylists: React.FC<LastPlaylistsProps> = ({
  items,
  onPlaylistClick,
}) => (
  <div className="flex flex-wrap gap-4 mt-4">
    {items.map((item) => (
      <MusicCardMd
        key={item.id}
        id="example-playlist"
        name={item.title}
        description={item.description || ''}
        imageUrl={item.cover || '/images/default-playlist.jpg'}
        onClick={onPlaylistClick}
      />
    ))}
  </div>
)
