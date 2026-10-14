'use client'

import { cn } from '@bitrate/ui-react'
import { Flag, Link2, MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ReportDialog } from '@/features/Report'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { ROUTES } from '@/shared/routes'
import { MenuItem } from '@/shared/ui'

type ArtistMoreMenuProps = {
  artistId: string
  artistName: string
}

/** "More options" for an artist: copy the profile link or report the artist. */
export const ArtistMoreMenu = ({
  artistId,
  artistName,
}: ArtistMoreMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const close = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        menuRef.current?.contains(event.target)
      )
        return
      setIsOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(ROUTES.artist(artistId), window.location.origin).href,
      )
      showApiSuccessToast('Link copied to clipboard')
    } catch (error) {
      showApiErrorToast(error, 'Failed to copy link')
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`More options for ${artistName}`}
        className="rounded-full p-2 text-text-subdued transition hover:scale-105 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <MoreHorizontal aria-hidden="true" size={25} />
      </button>
      {isOpen ? (
        <div
          aria-label={`${artistName} actions`}
          className={cn(
            Z_INDEX_CLASS.dropdownMenu,
            'absolute left-0 top-[calc(100%+8px)] w-56 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-1 text-sm text-text shadow-2xl',
          )}
          role="menu"
        >
          <MenuItem
            icon={<Link2 size={17} />}
            label="Copy link to artist"
            onClick={() => void copyLink()}
          />
          <MenuItem
            icon={<Flag size={17} />}
            label="Report"
            onClick={() => {
              setIsOpen(false)
              setIsReportOpen(true)
            }}
          />
        </div>
      ) : null}
      <ReportDialog
        entityId={artistId}
        entityName={artistName}
        entityType="artist"
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  )
}
