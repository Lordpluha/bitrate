import { PlaylistHeader } from '@views/Playlist/ui/PlaylistHeader'

export default function PlaylistNotFound() {
  return (
    <>
      <PlaylistHeader
        title="Playlist Not Found"
        type="Playlist"
        imageUrl="/images/default-playlist.jpg"
        author="Unknown"
        tracksCount={0}
        duration={0}
      />
      <div className="flex justify-center items-center h-64">
        <div className="text-text">Playlist not found</div>
      </div>
    </>
  )
}
