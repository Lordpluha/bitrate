'use client'

import { cn } from '@bitrate/ui-react'
import { Flag, Link2, MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ReportDialog } from '@/features/Report'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { useI18n } from '@/shared/i18n'
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
  const { t } = useI18n()
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
      showApiSuccessToast(t('playlist.linkCopied'))
    } catch (error) {
      showApiErrorToast(error, t('playlist.copyFailed'))
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('friends.moreOptions', { name: artistName })}
        className="flex text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <MoreHorizontal aria-hidden="true" className="size-5 md:size-6.5" />
      </button>
      {isOpen ? (
        <div
          aria-label={t('artist.actions', { name: artistName })}
          className={cn(
            Z_INDEX_CLASS.dropdownMenu,
            'absolute left-0 top-[calc(100%+8px)] w-56 max-w-[calc(100vw-2rem)] rounded-md bg-popover p-1 text-sm text-foreground shadow-2xl',
          )}
          role="menu"
        >
          <MenuItem
            icon={<Link2 size={17} />}
            label={t('artist.copyLink')}
            onClick={() => void copyLink()}
          />
          <MenuItem
            icon={<Flag size={17} />}
            label={t('playlist.report')}
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
