import { PlaylistHeader } from '@views/Playlist/ui/PlaylistHeader'
import { Spinner } from "@spotify/ui-react"

export default function Loading() {
  return (
    <>
      <PlaylistHeader
        title="Loading..."
        type="Playlist"
        imageUrl="/images/default-playlist.jpg"
        author="Loading..."
        tracksCount={0}
        duration={0}
      />
      <div className="flex justify-center items-center h-64">
        <div className="text-text"><Spinner /></div>
      </div>
    </>
  )
}
