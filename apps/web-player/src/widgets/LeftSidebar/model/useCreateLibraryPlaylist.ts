import { useRouter } from 'next/navigation'
import { useMemo, useRef } from 'react'
import { useCreatePlaylist, useMyPlaylists } from '@/entities/Playlist'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { ROUTES } from '@/shared/routes'

export const useCreateLibraryPlaylist = () => {
  const router = useRouter()
  const isCreatingRef = useRef(false)
  const { data: playlists } = useMyPlaylists()
  const createPlaylist = useCreatePlaylist()
  const title = useMemo(() => {
    const highestNumber = (playlists ?? []).reduce((highest, playlist) => {
      const match = /^My Playlist #(\d+)$/.exec(playlist.title.trim())
      const playlistNumber = Number(match?.[1] ?? 0)

      return Number.isSafeInteger(playlistNumber)
        ? Math.max(highest, playlistNumber)
        : highest
    }, 0)

    return `My Playlist #${highestNumber + 1}`
  }, [playlists])

  const create = async () => {
    if (isCreatingRef.current) return false
    isCreatingRef.current = true

    try {
      const playlist = await createPlaylist.mutateAsync({
        isPublic: true,
        title,
      })
      showApiSuccessToast('Added to Your Library.')
      router.push(ROUTES.playlist(playlist.id))
      return true
    } catch (error) {
      showApiErrorToast(error, 'Failed to create playlist')
      return false
    } finally {
      isCreatingRef.current = false
    }
  }

  return { create, isPending: createPlaylist.isPending }
}
