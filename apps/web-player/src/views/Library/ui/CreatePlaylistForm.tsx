'use client'

import { Button } from '@bitrate/ui-react'
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

  /** Failures are toasted by the query client's mutation cache. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedTitle = title.trim()
    if (!normalizedTitle) return

    createPlaylist.mutate(
      {
        description: description.trim() || undefined,
        isPublic,
        title: normalizedTitle,
      },
      {
        onSuccess: (playlist) => {
          showApiSuccessToast('Playlist created')
          setTitle('')
          setDescription('')
          setIsPublic(true)
          onClose()
          router.push(ROUTES.playlist(playlist.id))
        },
      },
    )
  }

  if (!isOpen) return null

  return (
    <form
      aria-label="New playlist"
      className="flex w-full max-w-140 flex-col gap-4 rounded-[14px] border border-border bg-card p-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-base font-semibold">New playlist</h2>
      <input
        aria-label="Playlist title"
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        maxLength={80}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Playlist title"
        required
        value={title}
      />
      <textarea
        aria-label="Description"
        className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        maxLength={240}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Add an optional description"
        value={description}
      />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          checked={isPublic}
          className="size-4 accent-primary"
          onChange={(event) => setIsPublic(event.target.checked)}
          type="checkbox"
        />
        Public playlist
      </label>
      <div className="flex gap-2.5">
        <Button
          className="h-9 px-6 text-sm font-medium"
          disabled={createPlaylist.isPending}
          type="submit"
          variant="primary"
        >
          Create
        </Button>
        <Button
          className="h-9 px-6 text-sm font-medium"
          onClick={onClose}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
