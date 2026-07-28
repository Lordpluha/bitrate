'use client'

import {
  Download,
  List,
  MoreHorizontal,
  Pause,
  Play,
  Shuffle,
  UserPlus,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LikePlaylistButton } from '@/entities/Playlist'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import type {
  PlaylistPlayback,
  TrackViewMode,
} from '@/views/Playlist/model/playlist.types'
import {
  PlaylistMoreMenu,
  TrackViewMenu,
} from '@/views/Playlist/ui/PlaylistMenus'

type PlaylistActionDetails = {
  cover: string
  id: string
  isOwner: boolean
  ownerName: string
  title: string
  tracksCount: number
}

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
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const viewMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        moreMenuRef.current?.contains(event.target as Node) ||
        viewMenuRef.current?.contains(event.target as Node)
      ) {
        return
      }

      setIsMoreOpen(false)
      setIsViewMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showApiSuccessToast('Link copied to clipboard')
      setIsMoreOpen(false)
    } catch (error) {
      showApiErrorToast(error, 'Failed to copy link')
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-gradient-to-b from-black/25 to-background px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex min-w-0 flex-wrap items-center gap-3 text-text-subdued sm:gap-4">
        {details.tracksCount > 0 && (
          <>
            <button
              aria-label={`${playback.isPlaying ? 'Pause' : 'Play'} ${details.title}`}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black transition-transform hover:scale-105 sm:h-14 sm:w-14"
              onClick={playback.handlePlayPlaylist}
              type="button"
            >
              {playback.isPlaying ? (
                <Pause fill="currentColor" size={26} />
              ) : (
                <Play fill="currentColor" size={26} />
              )}
            </button>
            <button
              aria-label="Shuffle playlist"
              className={
                playback.isShuffled
                  ? 'text-green-500 transition-colors hover:text-green-400'
                  : 'transition-colors hover:text-text'
              }
              onClick={playback.handleShufflePlaylist}
              type="button"
            >
              <Shuffle className="h-7 w-7 sm:h-7.5 sm:w-7.5" />
            </button>
            <LikePlaylistButton
              playlist={{
                cover: details.cover,
                id: details.id,
                ownerName: details.ownerName,
                title: details.title,
                tracksCount: details.tracksCount,
              }}
            />
            <button
              aria-label="Download playlist"
              className="transition-colors hover:text-text max-[480px]:hidden"
              type="button"
            >
              <Download className="h-7 w-7 sm:h-7.5 sm:w-7.5" />
            </button>
          </>
        )}
        {details.isOwner && (
          <button
            aria-label="Invite collaborators"
            className="transition-colors hover:text-text max-[480px]:hidden"
            type="button"
          >
            <UserPlus className="h-7 w-7 sm:h-8 sm:w-8" />
          </button>
        )}
        {details.tracksCount > 0 && (
          <button
            className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold text-text transition-colors hover:border-white max-[640px]:hidden"
            type="button"
          >
            Mix
          </button>
        )}
        <div className="relative" ref={moreMenuRef}>
          <button
            aria-expanded={isMoreOpen}
            aria-label="More playlist options"
            className="transition-colors hover:text-text"
            onClick={() => setIsMoreOpen((value) => !value)}
            type="button"
          >
            <MoreHorizontal className="h-7 w-7 sm:h-7.5 sm:w-7.5" />
          </button>
          {isMoreOpen && (
            <PlaylistMoreMenu
              canEdit={details.isOwner}
              onCopyLink={() => void copyLink()}
              onDelete={onDelete}
              onEdit={() => {
                onEdit()
                setIsMoreOpen(false)
              }}
            />
          )}
        </div>
      </div>
      <div className="relative" ref={viewMenuRef}>
        <button
          aria-expanded={isViewMenuOpen}
          aria-label="Change track list view"
          className="flex items-center gap-1.5 text-sm capitalize text-text-subdued transition-colors hover:text-text"
          onClick={() => setIsViewMenuOpen((value) => !value)}
          type="button"
        >
          <span className="max-[480px]:sr-only">{view.value}</span>
          <List size={18} />
        </button>
        {isViewMenuOpen && (
          <TrackViewMenu
            onChange={(viewMode) => {
              view.onChange(viewMode)
              setIsViewMenuOpen(false)
            }}
            value={view.value}
          />
        )}
      </div>
    </div>
  )
}
