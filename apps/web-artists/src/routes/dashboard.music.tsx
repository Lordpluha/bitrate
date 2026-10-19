import { type CatalogueSearch, catalogueSearchSchema } from '@entities/music'
import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router'
import { MusicView } from '@views/MusicView'

export const Route = createFileRoute('/dashboard/music')({
  validateSearch: (search: SearchSchemaInput & CatalogueSearch) =>
    catalogueSearchSchema.parse(search),
  component: MusicPage,
})

function MusicPage() {
  const search = Route.useSearch()
  return <MusicView search={search} />
}
