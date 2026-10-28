import { Music2 } from 'lucide-react'
import { CreateMenuItem } from '@/widgets/LeftSidebar/CreateMenuItem'

type CreatePlaylistActionsProps = {
  onCreate: () => void
}

export const CreatePlaylistActions = ({
  onCreate,
}: CreatePlaylistActionsProps) => (
  <>
    <CreateMenuItem
      description="Create a playlist with songs or episodes"
      icon={<Music2 size={24} />}
      onClick={onCreate}
      title="Playlist"
    />
  </>
)
