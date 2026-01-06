import { useQuery } from '@tanstack/react-query'
import axios, {AxiosResponse} from 'axios'
import { ITrack } from '@shared/types'

interface UseTracksParams {
  page?: number
  limit?: number
  title?: string
}

export const useTracks = (params: UseTracksParams = {}) => {
  const { page = 1, limit = 100, title } = params

  return useQuery({
    queryKey: ['tracks', page, limit, title],
    queryFn: async () => {
      const resp = await axios.get<any, AxiosResponse<{data: ITrack[]}>>(`${process.env.NEXT_PUBLIC_API_URL}tracks`, {
        params: {
          page,
          limit,
          ...(title && { title })
        }
      })
      return resp.data
    }
  })
}
