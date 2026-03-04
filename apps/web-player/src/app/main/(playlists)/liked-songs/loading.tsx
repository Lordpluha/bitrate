import { Spinner } from '@spotify/ui-react'
import { PlaylistHeader } from '@views/Playlist/ui/PlaylistHeader'

export default function Loading() {
  return (
    <>
      <PlaylistHeader
        author="Your Library"
        duration={0}
        imageUrl="/images/liked-songs.jpg"
        title="Liked Songs"
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
