import { createFileRoute } from '@tanstack/react-router'
import { PromotionView } from '@views/PromotionView'

export const Route = createFileRoute('/dashboard/promotion')({
  component: PromotionPage,
})

function PromotionPage() {
  const { artist } = Route.useRouteContext()
  return <PromotionView artistId={artist.id} />
}
