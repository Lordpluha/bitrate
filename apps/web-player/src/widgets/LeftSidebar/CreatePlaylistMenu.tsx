'use client'

import { PlusIcon } from '@spotify/ui-react'
import { useEffect, useRef, useState } from 'react'
import { CreatePlaylistActions } from '@/widgets/LeftSidebar/CreatePlaylistActions'

type CreatePlaylistMenuProps = {
  isPending: boolean
  onCreate: () => Promise<boolean>
}

export const CreatePlaylistMenu = ({
  isPending,
  onCreate,
}: CreatePlaylistMenuProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [])

  const toggleMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setPosition({ left: rect.left, top: rect.bottom + 8 })
    setIsOpen((value) => !value)
  }

  const createPlaylist = async () => {
    const wasCreated = await onCreate()
    if (wasCreated) setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 duration-200 hover:opacity-70 disabled:opacity-60"
        disabled={isPending}
        onClick={toggleMenu}
        ref={buttonRef}
        type="button"
      >
        <PlusIcon />
        <span className="font-bold">Create</span>
      </button>
      {isOpen && (
        <div
          className="fixed z-40 w-82 rounded-md bg-popover p-2 shadow-2xl"
          style={position}
        >
          <CreatePlaylistActions
            isPending={isPending}
            onCreate={() => void createPlaylist()}
          />
        </div>
      )}
    </div>
  )
}
