import { cn } from '@bitrate/ui-react'
import {
  Check,
  Flag,
  List,
  ListPlus,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { type TranslationKey, useI18n } from '@/shared/i18n'
import { MenuItem } from '@/shared/ui'
import type { TrackViewMode } from '@/views/Playlist/model/playlist.types'

export const VIEW_MODE_LABEL = {
  compact: 'playlist.view.compact',
  list: 'playlist.view.list',
} as const satisfies Record<TrackViewMode, TranslationKey>

type TrackViewMenuProps = {
  onChange: (viewMode: TrackViewMode) => void
  value: TrackViewMode
}

export const TrackViewMenu = ({ onChange, value }: TrackViewMenuProps) => {
  const { t } = useI18n()

  return (
    <div
      aria-label={t('playlist.trackListView')}
      className={cn(
        Z_INDEX_CLASS.dropdownMenu,
        'absolute right-0 top-[calc(100%+10px)] w-40 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-1 text-sm text-foreground shadow-2xl',
      )}
      role="menu"
    >
      <div className="px-3 py-2 text-xs font-bold text-muted-foreground">
        {t('playlist.viewAs')}
      </div>
      {(['compact', 'list'] as const).map((viewMode) => (
        <button
          aria-checked={value === viewMode}
          className={cn(
            'flex w-full items-center justify-between rounded-sm px-3 py-2 text-left capitalize transition-colors hover:bg-surface',
            value === viewMode ? 'text-primary' : 'text-foreground',
          )}
          key={viewMode}
          onClick={() => onChange(viewMode)}
          role="menuitemradio"
          type="button"
        >
          <span className="flex items-center gap-3">
            <List size={17} />
            {t(VIEW_MODE_LABEL[viewMode])}
          </span>
          {value === viewMode && <Check size={17} />}
        </button>
      ))}
    </div>
  )
}

type PlaylistMoreMenuProps = {
  canEdit: boolean
  hasTracks: boolean
  onAddToQueue: () => void
  onCopyLink: () => void
  onDelete: () => void
  onEdit: () => void
  onReport: () => void
}

export const PlaylistMoreMenu = ({
  canEdit,
  hasTracks,
  onAddToQueue,
  onCopyLink,
  onDelete,
  onEdit,
  onReport,
}: PlaylistMoreMenuProps) => {
  const { t } = useI18n()

  return (
    <div
      aria-label={t('playlist.actions')}
      className={cn(
        Z_INDEX_CLASS.dropdownMenu,
        'absolute left-0 top-[calc(100%+8px)] w-66 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-1 text-sm text-foreground shadow-2xl',
      )}
      role="menu"
    >
      <MenuItem
        disabled={!hasTracks}
        icon={<ListPlus size={17} />}
        label={t('trackMenu.addToQueue')}
        onClick={onAddToQueue}
      />
      <MenuItem
        disabled={!canEdit}
        icon={<Pencil size={17} />}
        label={t('playlist.editDetails')}
        onClick={onEdit}
      />
      <MenuItem
        disabled={!canEdit}
        icon={<Trash2 size={17} />}
        label={t('playlist.delete')}
        onClick={onDelete}
      />
      <div className="mx-2 my-1 border-t border-border" />
      <MenuItem
        icon={<Share2 size={17} />}
        label={t('playlist.share')}
        onClick={onCopyLink}
      />
      {!canEdit && (
        <MenuItem
          icon={<Flag size={17} />}
          label={t('playlist.report')}
          onClick={onReport}
        />
      )}
    </div>
  )
}
