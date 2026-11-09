import { createFileRoute } from '@tanstack/react-router'
import { ArtistView } from '@views/ArtistView'
import landingCss from '../styles/landing.css?url'
import workspaceCss from '../styles/workspace.css?url'

export const Route = createFileRoute('/')({
  // The studio replica reuses workspace markup, so the landing needs both sheets, in this order.
  head: () => ({
    links: [
      { rel: 'stylesheet', href: workspaceCss },
      { rel: 'stylesheet', href: landingCss },
    ],
  }),
  component: Artist,
})

function Artist() {
  return (
    <div>
      <ArtistView />
    </div>
  )
}
