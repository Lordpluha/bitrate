import { PlaylistHeader } from "@views/Playlist/ui/PlaylistHeader";

export default function Loading() {
  return (
    <>
      <PlaylistHeader
        title="Liked Songs"
        type="Playlist"
        imageUrl="/images/liked-songs.jpg"
        author="Your Library"
        tracksCount={0}
        duration={0}
      />
      <div className="flex justify-center items-center h-64">
        <div className="text-text">Loading liked songs...</div>
      </div>
    </>
  )
}
