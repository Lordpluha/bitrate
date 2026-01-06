import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Playlist {
  id: string
  name: string
  description?: string
  cover?: string
}

export const usePlaylist = (playlistId: string) => {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Playlist }>(
        `${process.env.NEXT_PUBLIC_API_URL}/playlists/${playlistId}`
      )
      return data.data
    },
    enabled: !!playlistId
  })
}
