import React from 'react'
import { MusicCardMd } from './MusicCardMd'

interface LastPlaylistItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

interface LastPlaylistsProps {
  items: LastPlaylistItem[]
}

export const LastPlaylists: React.FC<LastPlaylistsProps> = ({ items }) => (
  <div className='flex flex-wrap gap-4 mt-4'>
    {items.map(item => (
      <MusicCardMd
        key={item.id}
        id={item.id}
        name={item.name}
        description={item.description}
        imageUrl={item.imageUrl}
      />
    ))}
  </div>
)
