import { Spinner } from '@spotify/ui-react'
import { PlaylistHeader } from '@views/Playlist/ui/PlaylistHeader'

export default function Loading() {
  return (
    <>
      <PlaylistHeader
        author="Loading..."
        duration={0}
        imageUrl="/images/default-playlist.jpg"
        title="Loading..."
        tracksCount={0}
        type="Playlist"
      />
      <div className="flex justify-center items-center h-64">
        <div className="text-text">
          <Spinner />
        </div>
      </div>
    </>
  )
}
