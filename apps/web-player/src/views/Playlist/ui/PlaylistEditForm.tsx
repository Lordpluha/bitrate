'use client'

import { type FormEvent, useEffect, useState } from 'react'
import type { PlaylistWithTracks } from '@/entities/Playlist'
import { useUpdatePlaylist } from '@/entities/Playlist'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'

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
  const updatePlaylist = useUpdatePlaylist()
  const [title, setTitle] = useState(playlist.title)
  const [description, setDescription] = useState(playlist.description ?? '')

  useEffect(() => {
    setTitle(playlist.title)
    setDescription(playlist.description ?? '')
  }, [playlist.description, playlist.title])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await updatePlaylist.mutateAsync({
        body: {
          description: description.trim() || undefined,
          title: title.trim(),
        },
        playlistId: playlist.id,
      })
      showApiSuccessToast('Playlist updated')
      onClose()
    } catch (error) {
      showApiErrorToast(error, 'Failed to update playlist')
    }
  }

  if (!isOpen) return null

  return (
    <div className="border-b border-white/10 px-4 py-4 sm:px-6">
      <form className="grid max-w-160 gap-3" onSubmit={handleSubmit}>
        <input
          className="h-10 rounded-md bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          required
          value={title}
        />
        <textarea
          className="min-h-20 rounded-md bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
          maxLength={240}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          value={description}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
            disabled={updatePlaylist.isPending || title.trim().length === 0}
            type="submit"
          >
            Save
          </button>
          <button
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text hover:bg-white/15"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
