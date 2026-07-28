import {
  Check,
  FolderInput,
  List,
  Lock,
  MonitorUp,
  Pencil,
  Share2,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  UserRoundPlus,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { TrackViewMode } from '@/views/Playlist/model/playlist.types'

type TrackViewMenuProps = {
  onChange: (viewMode: TrackViewMode) => void
  value: TrackViewMode
}

export const TrackViewMenu = ({ onChange, value }: TrackViewMenuProps) => (
  <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-40 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-1 text-sm text-text shadow-2xl">
    <div className="px-3 py-2 text-xs font-bold text-text-subdued">View as</div>
    {(['compact', 'list'] as const).map((viewMode) => (
      <button
        className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left capitalize transition-colors hover:bg-white/10 ${
          value === viewMode ? 'text-green-500' : 'text-text'
        }`}
        key={viewMode}
        onClick={() => onChange(viewMode)}
        type="button"
      >
        <span className="flex items-center gap-3">
          <List size={17} />
          {viewMode}
        </span>
        {value === viewMode && <Check size={17} />}
      </button>
    ))}
  </div>
)

type PlaylistMoreMenuProps = {
  canEdit: boolean
  onCopyLink: () => void
  onDelete: () => void
  onEdit: () => void
}

type PlaylistMenuItemProps = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
}

const PlaylistMenuItem = ({
  disabled = false,
  icon,
  label,
  onClick,
}: PlaylistMenuItemProps) => (
  <button
    className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-text-subdued transition-colors hover:bg-white/10 hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {icon}
    <span>{label}</span>
  </button>
)

export const PlaylistMoreMenu = ({
  canEdit,
  onCopyLink,
  onDelete,
  onEdit,
}: PlaylistMoreMenuProps) => (
  <div className="absolute left-0 top-[calc(100%+8px)] z-[80] w-66 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-1 text-sm text-text shadow-2xl">
    <PlaylistMenuItem disabled icon={<List size={17} />} label="Add to queue" />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<UserRoundPlus size={17} />}
      label="Add to profile"
    />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<Pencil size={17} />}
      label="Edit details"
      onClick={onEdit}
    />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<Trash2 size={17} />}
      label="Delete"
      onClick={onDelete}
    />
    <div className="mx-2 my-1 border-t border-white/10" />
    <PlaylistMenuItem disabled icon={<Lock size={17} />} label="Make private" />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<UserPlus size={17} />}
      label="Invite collaborators"
    />
    <PlaylistMenuItem
      disabled
      icon={<SlidersHorizontal size={17} />}
      label="Exclude from your taste profile"
    />
    <PlaylistMenuItem
      disabled
      icon={<FolderInput size={17} />}
      label="Move to folder"
    />
    <PlaylistMenuItem
      icon={<Share2 size={17} />}
      label="Share"
      onClick={onCopyLink}
    />
    <div className="mx-2 my-1 border-t border-white/10" />
    <PlaylistMenuItem
      disabled
      icon={<MonitorUp size={17} />}
      label="Open in Desktop app"
    />
  </div>
)
