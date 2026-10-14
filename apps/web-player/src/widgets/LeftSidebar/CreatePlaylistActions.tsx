import { Music2 } from 'lucide-react'
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
  </>
)
