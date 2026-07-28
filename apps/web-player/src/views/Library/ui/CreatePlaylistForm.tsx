'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useCreatePlaylist } from '@/entities/Playlist'
import { showApiSuccessToast } from '@/shared/api/feedback'
import { ROUTES } from '@/shared/routes'

type CreatePlaylistFormProps = {
  isOpen: boolean
  onClose: () => void
}

export const CreatePlaylistForm = ({
  isOpen,
  onClose,
}: CreatePlaylistFormProps) => {
  const router = useRouter()
  const createPlaylist = useCreatePlaylist()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedTitle = title.trim()
    if (!normalizedTitle) return

    const playlist = await createPlaylist.mutateAsync({
      description: description.trim() || undefined,
      isPublic,
      title: normalizedTitle,
    })

    showApiSuccessToast('Playlist created')
    setTitle('')
    setDescription('')
    setIsPublic(true)
    onClose()
    router.push(ROUTES.playlist(playlist.id))
  }

  if (!isOpen) return null

  return (
    <form
      className="grid gap-3 rounded-lg bg-surface p-4"
      onSubmit={handleSubmit}
    >
      <input
        className="h-10 rounded-md bg-background px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
        maxLength={80}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Playlist title"
        required
        value={title}
      />
      <textarea
        className="min-h-20 rounded-md bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
        maxLength={240}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        value={description}
      />
      <label className="flex items-center gap-2 text-sm text-text">
        <input
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          type="checkbox"
        />
        Public playlist
      </label>
      <div className="flex gap-2">
        <button
          className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
          disabled={createPlaylist.isPending}
          type="submit"
        >
          Create
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
  )
}
