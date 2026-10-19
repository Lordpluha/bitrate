import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router'
import { AnalyticsView } from '@views/AnalyticsView'
import { z } from 'zod'

const analyticsSearchSchema = z.object({
  days: z.coerce
    .number()
    .pipe(z.union([z.literal(7), z.literal(28), z.literal(90)]))
    .catch(28),
})

export const Route = createFileRoute('/dashboard/analytics')({
  validateSearch: (search: SearchSchemaInput & { days?: number }) =>
    analyticsSearchSchema.parse(search),
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { days } = Route.useSearch()
  const { artist } = Route.useRouteContext()
  return <AnalyticsView artistId={artist.id} days={days} />
}
