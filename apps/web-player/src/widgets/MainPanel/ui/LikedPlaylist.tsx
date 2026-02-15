import { MusicCardMd } from '../../../shared/ui/MusicCardMd'

export const LikedPlaylist = () => (
  <div className="flex flex-wrap gap-4 mt-4">
    <MusicCardMd
      id="liked-songs"
      name="Любимые треки"
      description="Playlist"
      imageUrl="/images/liked-songs.jpg"
    />
  </div>
)
