import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router'
import { DistributionView } from '@views/DistributionView'
import { z } from 'zod'

const distributionSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
})

export const Route = createFileRoute('/dashboard/distribution')({
  validateSearch: (search: SearchSchemaInput & { page?: number }) =>
    distributionSearchSchema.parse(search),
  component: DistributionPage,
})

function DistributionPage() {
  const { page } = Route.useSearch()
  const { artist } = Route.useRouteContext()
  return <DistributionView artistId={artist.id} page={page} />
}
