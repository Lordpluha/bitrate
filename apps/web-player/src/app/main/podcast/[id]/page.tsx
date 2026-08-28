import { PodcastPage } from '@/views/Podcast'

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <PodcastPage podcastId={id} />
}
