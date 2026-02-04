import React from 'react'
import { MusicCardMd } from './MusicCardMd'

export const LikedPlaylist: React.FC = () => (
  <div className="flex flex-wrap gap-4 mt-4">
    <MusicCardMd
      id="liked-songs"
      name="Любимые треки"
      description="Playlist"
      imageUrl="/images/liked-songs.jpg"
    />
  </div>
)
