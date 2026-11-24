import { Button } from '@bitrate/ui-react'
import { useAiAllowance } from '@entities/promotion'
import {
  currentStage,
  type ReleaseStage,
  releasePipeline,
  releaseStages,
  useReleaseWorkspace,
} from '@entities/release'
import { ReleaseTitleEditor } from '@features/edit-release'
import { ReleaseChangesPanel } from '@features/propose-release-changes'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PageSkeleton } from '@shared/ui'
import { Link, useNavigate } from '@tanstack/react-router'
import { ReleaseDeliveryPanel } from '@widgets/ReleaseDelivery'
import { PromotionStage } from '@widgets/ReleasePromotion'
import {
  DraftStage,
  LaunchStage,
  ReleaseDangerZone,
  ReleaseHeader,
  ReleaseStepper,
  ReviewStage,
  type WorkspaceAction,
} from '@widgets/ReleaseWorkspace'
import { useState } from 'react'
import { WorkspaceDialogs } from './WorkspaceDialogs'

interface ReleaseWorkspaceViewProps {
  artistId: string
  releaseId: string
  /** The stage named in the URL; without one the release opens on its current stage. */
  step?: ReleaseStage
  /** The promotion POST step whose drafts are open. */
  postStepId?: string
}

export function ReleaseWorkspaceView({
  artistId,
  releaseId,
  step,
  postStepId,
}: ReleaseWorkspaceViewProps) {
  const query = useReleaseWorkspace(artistId, releaseId)
  const allowance = useAiAllowance(artistId)
  const navigate = useNavigate()
  const stages = allowance.data?.enabled ? releaseStages : releasePipeline
  const openPosts = (post: string | undefined) =>
    navigate({
      to: '/dashboard/music/$releaseId',
      params: { releaseId },
      search: { step: 'promotion', post },
      resetScroll: false,
    })
  const { t, tMessage } = useI18n()
  const [saved, setSaved] = useState(false)
  const [dialog, setDialog] = useState<WorkspaceAction | null>(null)
  /** Opening the next dialog is the next action, so it retires the saved notice. */
  const openDialog = (next: WorkspaceAction) => {
    setSaved(false)
    setDialog(next)
  }
  const stage = step ?? (query.data ? currentStage(query.data.status) : null)
  return (
    <div aria-busy={query.isFetching} className="artist-release-workspace">
      {query.isPending ? (
        <PageSkeleton label={t('workspace.loading')} variant="release" />
      ) : query.isError ? (
        <div className="space-y-4 py-8">
          <h1 className="text-2xl">{t('workspace.unavailable')}</h1>
          <p role="alert">{tMessage(query.error.message)}</p>
          <Button
            onClick={() => {
              void query.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
          <Link
            className="block underline"
            search={{ tab: 'releases', page: 1 }}
            to={ROUTES.dashboard.music}
          >
            {t('workspace.returnToMusic')}
          </Link>
        </div>
      ) : (
        <>
          {saved && (
            <p
              className="mb-4 rounded-lg border border-border bg-secondary p-4 text-sm"
              role="status"
            >
              {t('workspace.draftUpdated')}
            </p>
          )}
          <Link
            className="artist-release-back lg:hidden"
            search={{ tab: 'releases', page: 1 }}
            to={ROUTES.dashboard.music}
          >
            {t('shell.backToMusic')}
          </Link>
          <ReleaseHeader
            onAction={openDialog}
            release={query.data}
            titleEditor={
              <ReleaseTitleEditor
                artistId={artistId}
                onSaved={() => setSaved(true)}
                release={query.data}
              />
            }
          />
          <ReleaseStepper
            active={stage ?? 'draft'}
            release={query.data}
            stages={stages}
          />
          {stage === 'draft' && (
            <DraftStage
              artistId={artistId}
              onAction={openDialog}
              release={query.data}
            />
          )}
          {stage === 'review' && (
            <ReviewStage artistId={artistId} release={query.data} />
          )}
          {stage === 'deliver' && (
            <ReleaseDeliveryPanel
              artistId={artistId}
              release={query.data}
              releaseId={releaseId}
            />
          )}
          {stage === 'launch' && (
            <LaunchStage
              artistId={artistId}
              promotion={allowance.data?.enabled === true}
              release={query.data}
            />
          )}
          {stage === 'promotion' && (
            <PromotionStage
              artistId={artistId}
              onOpenPosts={(post) => void openPosts(post)}
              postStepId={postStepId}
              release={query.data}
            />
          )}
          {query.data.acceptsChanges && (
            <ReleaseChangesPanel
              artistId={artistId}
              recordings={query.data.trackDrafts.filter(
                (recording) => !recording.sourceTrackId,
              )}
              release={query.data}
            />
          )}
          <ReleaseDangerZone onDelete={() => openDialog({ kind: 'delete' })} />
        </>
      )}
      {dialog && (
        <WorkspaceDialogs
          artistId={artistId}
          dialog={dialog}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            setSaved(true)
          }}
          release={query.data}
          releaseId={releaseId}
        />
      )}
    </div>
  )
}
