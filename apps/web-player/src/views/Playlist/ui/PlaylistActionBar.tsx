'use client'

import { List, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import type {
  PlaylistPlayback,
  TrackViewMode,
} from '@/views/Playlist/model/playlist.types'
import { usePlaylistActionMenus } from '@/views/Playlist/model/usePlaylistActionMenus'
import {
  PlaylistMoreMenu,
  TrackViewMenu,
} from '@/views/Playlist/ui/PlaylistMenus'
import {
  type PlaylistActionDetails,
  PlaylistPrimaryActions,
} from '@/views/Playlist/ui/PlaylistPrimaryActions'
import { ReportPlaylistDialog } from '@/views/Playlist/ui/ReportPlaylistDialog'

type PlaylistViewControl = {
  onChange: (viewMode: TrackViewMode) => void
  value: TrackViewMode
}

type PlaylistActionBarProps = {
  details: PlaylistActionDetails
  onDelete: () => void
  onEdit: () => void
  playback: PlaylistPlayback
  view: PlaylistViewControl
}

export const PlaylistActionBar = ({
  details,
  onDelete,
  onEdit,
  playback,
  view,
}: PlaylistActionBarProps) => {
  const menus = usePlaylistActionMenus()
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between gap-4 bg-gradient-to-b from-black/25 to-background px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3 text-text-subdued sm:gap-4">
          <PlaylistPrimaryActions details={details} playback={playback} />
          <div className="relative" ref={menus.moreMenuRef}>
            <button
              aria-expanded={menus.isMoreOpen}
              aria-label="More playlist options"
              className="transition-colors hover:text-text"
              onClick={menus.toggleMoreMenu}
              type="button"
            >
              <MoreHorizontal className="h-7 w-7 sm:h-7.5 sm:w-7.5" />
            </button>
            {menus.isMoreOpen && (
              <PlaylistMoreMenu
                canEdit={details.isOwner}
                onCopyLink={() => void menus.copyLink()}
                onDelete={onDelete}
                onEdit={() => {
                  onEdit()
                  menus.closeMoreMenu()
                }}
                onReport={() => {
                  menus.closeMoreMenu()
                  setIsReportOpen(true)
                }}
              />
            )}
          </div>
        </div>
        <div className="relative" ref={menus.viewMenuRef}>
          <button
            aria-expanded={menus.isViewMenuOpen}
            aria-label="Change track list view"
            className="flex items-center gap-1.5 text-sm capitalize text-text-subdued transition-colors hover:text-text"
            onClick={menus.toggleViewMenu}
            type="button"
          >
            <span className="max-[480px]:sr-only">{view.value}</span>
            <List size={18} />
          </button>
          {menus.isViewMenuOpen && (
            <TrackViewMenu
              onChange={(viewMode) => {
                view.onChange(viewMode)
                menus.setIsViewMenuOpen(false)
              }}
              value={view.value}
            />
          )}
        </div>
      </div>
      <ReportPlaylistDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        playlistId={details.id}
        playlistTitle={details.title}
      />
    </>
  )
}
