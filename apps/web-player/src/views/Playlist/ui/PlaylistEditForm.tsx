'use client'

import { type FormEvent, useEffect, useState } from 'react'
import type { PlaylistWithTracks } from '@/entities/Playlist'
import { useUpdatePlaylist } from '@/entities/Playlist'
import { showApiSuccessToast } from '@/shared/api/feedback'
import { useI18n } from '@/shared/i18n'

type PlaylistEditFormProps = {
  isOpen: boolean
  onClose: () => void
  playlist: PlaylistWithTracks
}

export const PlaylistEditForm = ({
  isOpen,
  onClose,
  playlist,
}: PlaylistEditFormProps) => {
  const { t } = useI18n()
  const updatePlaylist = useUpdatePlaylist()
  const [title, setTitle] = useState(playlist.title)
  const [description, setDescription] = useState(playlist.description ?? '')

  useEffect(() => {
    setTitle(playlist.title)
    setDescription(playlist.description ?? '')
  }, [playlist.description, playlist.title])

  /** Failures are toasted by the query client's mutation cache. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    updatePlaylist.mutate(
      {
        body: {
          description: description.trim() || undefined,
          title: title.trim(),
        },
        playlistId: playlist.id,
      },
      {
        onSuccess: () => {
          showApiSuccessToast(t('playlist.updated'))
          onClose()
        },
      },
    )
  }

  if (!isOpen) return null

  return (
    <div className="border-b border-border px-4 py-4 sm:px-6">
      <form className="grid max-w-160 gap-3" onSubmit={handleSubmit}>
        <input
          className="h-10 rounded-md bg-surface px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-white/30"
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          required
          value={title}
        />
        <textarea
          className="min-h-20 rounded-md bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-white/30"
          maxLength={240}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('playlist.description')}
          value={description}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary-hover disabled:opacity-60"
            disabled={updatePlaylist.isPending || title.trim().length === 0}
            type="submit"
          >
            {t('common.save')}
          </button>
          <button
            className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-hover"
            onClick={onClose}
            type="button"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
