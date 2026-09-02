'use client'

import {
  PlusIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { CreatePlaylistActions } from '@/widgets/LeftSidebar/CreatePlaylistActions'

type CreatePlaylistMenuProps = {
  isPending: boolean
  onCreate: () => Promise<boolean>
}

export const CreatePlaylistMenu = ({
  isPending,
  onCreate,
}: CreatePlaylistMenuProps) => {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const createPlaylist = async () => {
    const wasCreated = await onCreate()
    if (wasCreated) setIsOpen(false)
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 duration-200 hover:opacity-70 disabled:opacity-60"
          disabled={isPending}
          type="button"
        >
          <PlusIcon />
          <span className="font-bold">{t('common.create')}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={t('library.createPlaylist')}
        className="w-82 rounded-md !border-border !bg-popover p-2 !text-text shadow-2xl"
        sideOffset={8}
      >
        <CreatePlaylistActions
          isPending={isPending}
          onCreate={() => void createPlaylist()}
        />
      </PopoverContent>
    </Popover>
  )
}
