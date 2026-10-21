import {
  type ReleaseWorkspace,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'
import { WorkspaceNextStep } from './WorkspaceNextStep'
import { WorkspaceOverview } from './WorkspaceOverview'
import { WorkspaceParticipants } from './WorkspaceParticipants'
import { WorkspacePreparation } from './WorkspacePreparation'
import { WorkspaceReadiness } from './WorkspaceReadiness'
import { WorkspaceReview } from './WorkspaceReview'
import { WorkspaceRights } from './WorkspaceRights'
import { WorkspaceRoadmap } from './WorkspaceRoadmap'
import { WorkspaceStages } from './WorkspaceStages'
import { WorkspaceTracks } from './WorkspaceTracks'

interface ReleaseWorkspaceContentProps {
  artistId: string
  release: ReleaseWorkspace
  /** Every button that opens a dialog reports here. */
  onAction: WorkspaceActionHandler
  /** Further panels composed by the page, such as release tasks. */
  children?: ReactNode
}

export function ReleaseWorkspaceContent({
  artistId,
  release,
  onAction,
  children,
}: ReleaseWorkspaceContentProps) {
  return (
    <>
      <header className="artist-release-page-heading">
        <h1>{release.title}</h1>
        <p>
          {releaseTypeLabels[release.type]} ·{' '}
          {releaseStatusLabels[release.status]}
        </p>
      </header>
      <Link
        className="artist-release-back lg:hidden"
        search={{ tab: 'releases', page: 1 }}
        to={ROUTES.dashboard.music}
      >
        Back to music
      </Link>
      <div className="artist-release-workspace-panels">
        <WorkspaceOverview onAction={onAction} release={release} />
        <WorkspaceStages status={release.status} />
        <WorkspaceNextStep release={release} />
        <WorkspacePreparation onAction={onAction} release={release} />
        <WorkspaceReview release={release} />
        <WorkspaceRoadmap release={release} />
        <WorkspaceTracks
          artistId={artistId}
          onAction={onAction}
          release={release}
        />
        <WorkspaceRights onAction={onAction} release={release} />
        <WorkspaceReadiness artistId={artistId} release={release} />
        <WorkspaceParticipants onAction={onAction} release={release} />
        {children}
      </div>
      <p className="artist-release-disclaimer">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        {release.isDemo ? 'Illustrative demo data. ' : ''}Preparation details do
        not confirm approval or external delivery.
      </p>
    </>
  )
}
