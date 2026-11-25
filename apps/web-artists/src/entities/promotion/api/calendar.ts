import { clientFetchClient } from '@shared/api/fetchClient'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { calendarEntrySchema } from '../model/promotion.schema'
import { promotionKeys } from './promotionKeys'
import { readPromotion } from './promotionRequest'

const calendarSchema = z.array(calendarEntrySchema)

/** Dated steps across every release, soonest first, in the server's default window. */
export function usePromotionCalendar(artistId: string, enabled = true) {
  return useQuery({
    queryKey: promotionKeys.calendar(artistId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/me/promotion/calendar',
        { signal },
      )
      return readPromotion(
        result,
        calendarSchema,
        'promotion.error.loadCalendar',
      )
    },
    enabled,
    staleTime: 30_000,
  })
}
