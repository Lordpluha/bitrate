'use client'

import { cn } from '@spotify/ui-react'
import { X } from 'lucide-react'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useOverlayFocus } from '@/shared/hooks'
import { CreatePlaylistActions } from '@/widgets/LeftSidebar/CreatePlaylistActions'
import { useCreateLibraryPlaylist } from '@/widgets/LeftSidebar/model/useCreateLibraryPlaylist'

type MobileCreatePlaylistSheetProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const MobileCreatePlaylistSheet = ({
  isOpen,
  onOpenChange,
}: MobileCreatePlaylistSheetProps) => {
  const playlist = useCreateLibraryPlaylist()
  const dialogRef = useOverlayFocus<HTMLDivElement>({
    isOpen,
    onClose: () => onOpenChange(false),
  })

  if (!isOpen) return null

  const createPlaylist = async () => {
    const wasCreated = await playlist.create()
    if (wasCreated) onOpenChange(false)
  }

  return (
    <>
      <button
        aria-hidden="true"
        className={cn(
          Z_INDEX_CLASS.mobileSheetBackdrop,
          'fixed inset-0 bg-black/75',
        )}
        onClick={() => onOpenChange(false)}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label="Create"
        aria-modal="true"
        className={cn(
          Z_INDEX_CLASS.mobileSheetContent,
          'fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] max-h-[70dvh] overflow-y-auto rounded-xl border border-white/10 bg-popover p-3 shadow-2xl custom-scrollbar',
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="mb-1 flex items-center justify-between px-3 py-2">
          <h2 className="text-lg font-bold text-text">Create</h2>
          <button
            aria-label="Close create menu"
            className="rounded-full p-2 text-text-subdued transition-colors hover:bg-surface hover:text-text"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <CreatePlaylistActions
          isPending={playlist.isPending}
          onCreate={() => void createPlaylist()}
        />
      </div>
    </>
  )
}
