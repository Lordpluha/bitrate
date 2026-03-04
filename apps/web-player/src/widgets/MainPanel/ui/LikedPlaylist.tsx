import { MusicCardMd } from '../../../shared/ui/MusicCardMd'

export const LikedPlaylist = () => (
  <div className="flex flex-wrap gap-4 mt-4">
    <MusicCardMd
      description="Playlist"
      id="liked-songs"
      imageUrl="/images/liked-songs.jpg"
      name="Любимые треки"
    />
  </div>
)
