'use client'

import { useCreatePlaylist, useMyPlaylists } from '@entities/Playlist'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { PlusIcon, Typography } from '@spotify/ui-react'
import {
  Disc3,
  Folder,
  Maximize2,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

type LibraryHeaderProps = {
  isCollapsed?: boolean
  isExpanded?: boolean
  onToggleCollapsed?: () => void
  onToggleExpanded?: () => void
}

export const LibraryHeader = ({
  isCollapsed = false,
  isExpanded = false,
  onToggleCollapsed,
  onToggleExpanded,
}: LibraryHeaderProps) => {
  const router = useRouter()
  const createButtonRef = useRef<HTMLButtonElement>(null)
  const createMenuRef = useRef<HTMLDivElement>(null)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
  const [createMenuPosition, setCreateMenuPosition] = useState({
    left: 0,
    top: 0,
  })
  const { data: myPlaylists } = useMyPlaylists()
  const createPlaylist = useCreatePlaylist()

  const nextPlaylistTitle = useMemo(() => {
    const playlistsCount = Array.isArray(myPlaylists)
      ? (myPlaylists as unknown[]).length
      : 0

    return `My Playlist #${playlistsCount + 1}`
  }, [myPlaylists])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        !createMenuRef.current ||
        createMenuRef.current.contains(event.target as Node)
      ) {
        return
      }

      setIsCreateMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleCreatePlaylist = async () => {
    try {
      const playlist = await createPlaylist.mutateAsync({
        isPublic: true,
        title: nextPlaylistTitle,
      })

      setIsCreateMenuOpen(false)
      showApiSuccessToast('Added to Your Library.')
      router.push(ROUTES.playlist(playlist.id))
    } catch (error) {
      showApiErrorToast(error, 'Failed to create playlist')
    }
  }

  const handleToggleCreateMenu = () => {
    const rect = createButtonRef.current?.getBoundingClientRect()

    if (rect) {
      setCreateMenuPosition({
        left: rect.left,
        top: rect.bottom + 8,
      })
    }

    setIsCreateMenuOpen((value) => !value)
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          aria-label="Open Your Library"
          className="rounded-md p-2 text-text-subdued transition-colors hover:bg-surface hover:text-text"
          onClick={onToggleCollapsed}
          title="Open Your Library"
          type="button"
        >
          <PanelLeftOpen size={22} />
        </button>
        <button
          aria-label="Create playlist"
          className="rounded-full bg-surface p-3 text-text transition-colors hover:bg-surface-hover"
          disabled={createPlaylist.isPending}
          onClick={handleCreatePlaylist}
          title="Create"
          type="button"
        >
          <PlusIcon />
        </button>
      </div>
    )
  }

  return (
    <div className="group/header flex gap-2 justify-between items-center">
      <div className="flex min-w-0 items-center">
        <div className="w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-200 ease-out group-hover/header:w-8 group-hover/header:opacity-100">
          <button
            aria-label="Collapse Your Library"
            className="mr-2 rounded p-1 text-text-subdued transition-colors hover:bg-surface hover:text-text"
            onClick={onToggleCollapsed}
            title="Collapse Your Library"
            type="button"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <Typography as="h6" className="truncate" size="heading6">
          Your Library
        </Typography>
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative" ref={createMenuRef}>
          <button
            aria-expanded={isCreateMenuOpen}
            className="px-4 py-2 rounded-full duration-200 flex items-center gap-2 bg-surface hover:opacity-70 disabled:opacity-60"
            disabled={createPlaylist.isPending}
            onClick={handleToggleCreateMenu}
            ref={createButtonRef}
            type="button"
          >
            <PlusIcon />
            <span className="font-bold">Create</span>
          </button>
          {isCreateMenuOpen && (
            <div
              className="fixed z-40 w-82 rounded-md bg-surface p-2 shadow-2xl"
              style={{
                left: createMenuPosition.left,
                top: createMenuPosition.top,
              }}
            >
              <CreateMenuItem
                description="Create a playlist with songs or episodes"
                icon={<Music2 size={24} />}
                onClick={handleCreatePlaylist}
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
            </div>
          )}
        </div>
        <button
          aria-label={
            isExpanded ? 'Collapse Your Library' : 'Expand Your Library'
          }
          className="duration-200 hover:opacity-70"
          onClick={onToggleExpanded}
          title={isExpanded ? 'Collapse Your Library' : 'Expand Your Library'}
          type="button"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  )
}

type CreateMenuItemProps = {
  description: string
  disabled?: boolean
  icon: ReactNode
  onClick?: () => void
  title: string
}

const CreateMenuItem = ({
  description,
  disabled = false,
  icon,
  onClick,
  title,
}: CreateMenuItemProps) => (
  <button
    className="grid w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-text-subdued">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block font-bold text-text">{title}</span>
      <span className="block truncate text-sm text-text-subdued">
        {description}
      </span>
    </span>
  </button>
)
