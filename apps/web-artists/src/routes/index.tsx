import { createFileRoute } from '@tanstack/react-router'
import { ArtistView } from '@views/ArtistView'

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
