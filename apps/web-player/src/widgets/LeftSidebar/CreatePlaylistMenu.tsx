'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@bitrate/ui-react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { CreatePlaylistActions } from '@/widgets/LeftSidebar/CreatePlaylistActions'

/** The library panel's Create menu; a playlist is created through the library's form. */
export const CreatePlaylistMenu = () => {
  const { t } = useI18n()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const openForm = () => {
    setIsOpen(false)
    router.push(ROUTES.createPlaylist)
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t('common.create')}
          className="flex size-7 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
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
        <CreatePlaylistActions onCreate={openForm} />
      </PopoverContent>
    </Popover>
  )
}
