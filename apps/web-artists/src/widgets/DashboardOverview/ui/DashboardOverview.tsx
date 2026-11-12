import type { ArtistDashboard } from '@entities/dashboard'
import { type CustomizableLayout, LayoutGrid } from '@features/workspace-layout'
import { ActivityTile } from './ActivityTile'
import { AttentionTile } from './AttentionTile'
import { ComingUpTile } from './ComingUpTile'
import { CurrentReleaseTile } from './CurrentReleaseTile'
import { ListeningTile } from './ListeningTile'
import { NumbersTile } from './NumbersTile'
import { PremiereTile } from './PremiereTile'
import { ReleasesTile } from './ReleasesTile'

interface DashboardOverviewProps {
  artistId: string
  dashboard: ArtistDashboard
  /** The artist's arrangement of `dashboardTiles`. */
  layout: CustomizableLayout
}

/** Returning-artist dashboard: a bento of tiles the artist can arrange. */
export function DashboardOverview({
  artistId,
  dashboard,
  layout,
}: DashboardOverviewProps) {
  const renderTile = (id: string) => {
    switch (id) {
      case 'current':
        return <CurrentReleaseTile release={dashboard.currentRelease} />
      case 'attention':
        return <AttentionTile items={dashboard.attention} />
      case 'numbers':
        return <NumbersTile artistId={artistId} counts={dashboard.counts} />
      case 'premiere':
        return <PremiereTile dashboard={dashboard} />
      case 'releases':
        return <ReleasesTile artistId={artistId} />
      case 'coming-up':
        return <ComingUpTile dashboard={dashboard} />
      case 'activity':
        return <ActivityTile artistId={artistId} />
      case 'listening':
        return <ListeningTile />
      default:
        return null
    }
  }
  return (
    <LayoutGrid
      className="artist-dash-grid"
      layout={layout}
      renderTile={renderTile}
    />
  )
}
