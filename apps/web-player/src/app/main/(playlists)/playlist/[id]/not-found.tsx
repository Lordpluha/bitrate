import { PlaylistHeader } from '@views/Playlist/ui/PlaylistHeader'

export default function PlaylistNotFound() {
  return (
    <>
      <PlaylistHeader
        author="Unknown"
        duration={0}
        imageUrl="/images/default-playlist.jpg"
        title="Playlist Not Found"
        tracksCount={0}
        type="Playlist"
      />
      <div className="flex justify-center items-center h-64">
        <div className="text-text">Playlist not found</div>
      </div>
    </>
  )
}
