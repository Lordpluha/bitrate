'use client'

import { List, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { ReportDialog } from '@/features/Report'
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
      <div className="flex items-center justify-between gap-4.5">
        <div className="flex min-w-0 flex-1 items-center gap-4.5 text-muted-foreground">
          <PlaylistPrimaryActions details={details} playback={playback} />
          <div className="relative" ref={menus.moreMenuRef}>
            <button
              aria-expanded={menus.isMoreOpen}
              aria-label="More playlist options"
              className="transition-colors hover:text-foreground"
              onClick={menus.toggleMoreMenu}
              type="button"
            >
              <MoreHorizontal
                aria-hidden="true"
                className="size-5 md:size-6.5"
              />
            </button>
            {menus.isMoreOpen && (
              <PlaylistMoreMenu
                canEdit={details.isOwner}
                hasTracks={details.tracksCount > 0}
                onAddToQueue={() => {
                  playback.handleAddToQueue()
                  menus.closeMoreMenu()
                }}
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
        <div className="relative max-[1024px]:hidden" ref={menus.viewMenuRef}>
          <button
            aria-expanded={menus.isViewMenuOpen}
            aria-label="Change track list view"
            className="flex items-center gap-1.5 text-sm capitalize text-muted-foreground transition-colors hover:text-foreground"
            onClick={menus.toggleViewMenu}
            type="button"
          >
            <span>{view.value}</span>
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
      <ReportDialog
        entityId={details.id}
        entityName={details.title}
        entityType="playlist"
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  )
}
