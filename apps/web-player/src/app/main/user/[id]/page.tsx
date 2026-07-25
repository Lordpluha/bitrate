import { PublicProfilePage } from '@views/Profile'

type PublicProfileRouteProps = {
  params: Promise<{ id: string }>
}

export default async function PublicProfileRoute({
  params,
}: PublicProfileRouteProps) {
  const { id } = await params

  return <PublicProfilePage userId={id} />
}
