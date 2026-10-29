import { Button } from '@bitrate/ui-react'
import { useContributor } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { ContributorForm } from './ContributorForm'

interface EditContributorDialogProps {
  artistId: string
  releaseId: string
  contributorId: string
  onClose: () => void
  onSaved: () => void
}

export function EditContributorDialog({
  artistId,
  releaseId,
  contributorId,
  onClose,
  onSaved,
}: EditContributorDialogProps) {
  const { t, tMessage } = useI18n()
  const query = useContributor(artistId, releaseId, contributorId)
  if (
    query.data &&
    !query.isFetching &&
    !query.isError &&
    query.data.release.status === 'DRAFT'
  )
    return (
      <ContributorForm
        artistId={artistId}
        onClose={onClose}
        onSaved={onSaved}
        participant={query.data.participant}
        release={query.data.release}
      />
    )
  return (
    <WorkspaceModal onClose={onClose} title={t('editRelease.editContributor')}>
      {query.isPending || query.isFetching ? (
        <p role="status">{t('editRelease.loadingContributor')}</p>
      ) : query.isError ? (
        <div className="space-y-4">
          <p role="alert">{tMessage(query.error.message)}</p>
          <Button
            onClick={() => {
              void query.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : (
        <p role="alert">{t('editRelease.notDraft')}</p>
      )}
    </WorkspaceModal>
  )
}
