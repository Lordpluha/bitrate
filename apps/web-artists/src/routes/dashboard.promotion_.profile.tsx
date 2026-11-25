import { createFileRoute } from '@tanstack/react-router'
import { PromotionProfileView } from '@views/PromotionProfileView'

export const Route = createFileRoute('/dashboard/promotion_/profile')({
  component: PromotionProfilePage,
})

function PromotionProfilePage() {
  const { artist } = Route.useRouteContext()
  return <PromotionProfileView artistId={artist.id} />
}
