import React from 'react'
import type { ApiSchemas } from '@spotify/contracts'
import { MusicCardMd } from './MusicCardMd'
import { getPlaylistName, getPlaylistImage } from '@shared/utils/apiHelpers'

type LastPlaylistItem = ApiSchemas['PlaylistEntity']

interface LastPlaylistsProps {
  items: LastPlaylistItem[]
  onPlaylistClick?: (id: string) => void
}

export const LastPlaylists: React.FC<LastPlaylistsProps> = ({ items, onPlaylistClick }) => (
  <div className='flex flex-wrap gap-4 mt-4'>
    {items.map(item => (
      <MusicCardMd
        key={item.id}
        id={item.id}
        name={getPlaylistName(item)}
        description={item.description || ''}
        imageUrl={getPlaylistImage(item)}
        onClick={onPlaylistClick}
      />
    ))}
  </div>
)
