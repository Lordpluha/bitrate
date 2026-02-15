import { PlaylistHeader } from "@views/Playlist/ui/PlaylistHeader";

export default function LikedSongsNotFound() {
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
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">No liked songs found</h1>
        <p className="text-text">
          You haven't liked any songs yet. Start exploring and like your
          favorite tracks!
        </p>
      </div>
    </>
  )
}
