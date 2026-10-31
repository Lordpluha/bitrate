import { Button } from '@bitrate/ui-react'
import {
  currentStage,
  type ReleaseStage,
  useReleaseWorkspace,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ReleaseDeliveryPanel } from '@widgets/ReleaseDelivery'
import {
  DraftStage,
  LaunchStage,
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
}

export function ReleaseWorkspaceView({
  artistId,
  releaseId,
  step,
}: ReleaseWorkspaceViewProps) {
  const query = useReleaseWorkspace(artistId, releaseId)
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
        <p role="status">{t('workspace.loading')}</p>
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
          <ReleaseHeader onAction={openDialog} release={query.data} />
          <ReleaseStepper active={stage ?? 'draft'} release={query.data} />
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
            <LaunchStage artistId={artistId} release={query.data} />
          )}
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
