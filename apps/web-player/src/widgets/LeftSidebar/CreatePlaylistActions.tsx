import { Disc3, Folder, Music2 } from 'lucide-react'
import { CreateMenuItem } from '@/widgets/LeftSidebar/CreateMenuItem'

type CreatePlaylistActionsProps = {
  isPending: boolean
  onCreate: () => void
}

export const CreatePlaylistActions = ({
  isPending,
  onCreate,
}: CreatePlaylistActionsProps) => (
  <>
    <CreateMenuItem
      description="Create a playlist with songs or episodes"
      disabled={isPending}
      icon={<Music2 size={24} />}
      onClick={onCreate}
      title="Playlist"
    />
    <CreateMenuItem
      description="Combine your friends' tastes into a playlist"
      disabled
      icon={<Disc3 size={24} />}
      title="Blend"
    />
    <div className="mx-3 my-2 border-t border-white/15" />
    <CreateMenuItem
      description="Organize your playlists"
      disabled
      icon={<Folder size={24} />}
      title="Folder"
    />
  </>
)
