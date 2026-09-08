import { ArtistView } from '@views/ArtistView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Artist,
})

function Artist() {
  return (
    <div>
      <ArtistView />
    </div>
  )
}
