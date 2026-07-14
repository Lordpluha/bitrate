import { PlaylistServerApi } from '@entities/Playlist/api/server/PlaylistApi.server'
import { ROUTES } from '@shared/routes'
import { PlaylistPage } from '@views/Playlist'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type PlaylistDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { id } = await params
  const resp = await PlaylistServerApi.getPlaylists(id)

  if (resp.response.status === 401) {
    redirect(ROUTES.auth.login)
  }

  if (resp.response.status === 429) {
    return <PlaylistRateLimited />
  }

  if (!resp.response.ok || !resp.data?.id) {
    notFound()
  }

  return <PlaylistPage key={resp.data.id} playlist={resp.data} />
}

const PlaylistRateLimited = () => (
  <div className="flex min-h-96 flex-col items-center justify-center gap-3 px-6 text-center">
    <h1 className="text-3xl font-bold text-text">Too many playlist requests</h1>
    <p className="max-w-110 text-sm text-text-subdued">
      Playlist data is temporarily rate limited. Wait a few seconds and open the
      playlist again.
    </p>
  </div>
)
