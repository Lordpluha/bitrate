'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@bitrate/ui-react'
import { Plus } from 'lucide-react'
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
          aria-label={t('common.create')}
          className="flex size-7 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-60"
          disabled={isPending}
          title={t('common.create')}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
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
