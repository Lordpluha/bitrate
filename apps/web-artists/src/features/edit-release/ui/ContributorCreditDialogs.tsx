import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useCreditSelf,
  useRemoveContributor,
} from '@entities/release'
import { Interpolate, useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useState } from 'react'

interface CreditDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

interface RemoveContributorDialogProps extends CreditDialogProps {
  contributorId: string
}

export function RemoveContributorDialog({
  artistId,
  release,
  contributorId,
  onClose,
  onSaved,
}: RemoveContributorDialogProps) {
  const { t, tMessage } = useI18n()
  const remove = useRemoveContributor(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const person = release.participants.find((item) => item.id === contributorId)

  const confirm = async () => {
    try {
      await remove.mutateAsync({
        id: release.id,
        contributorId,
        expectedUpdatedAt,
      })
      onSaved()
    } catch {
      // The credit stays; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!remove.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('workspace.credits.removeContributor')}
    >
      <div aria-busy={remove.isPending} className="space-y-6">
        <p>
          <Interpolate
            message={t('editRelease.removeConfirm')}
            values={{
              name: (
                <strong>
                  {person?.displayName ?? t('editRelease.thisContributor')}
                </strong>
              ),
            }}
          />
        </p>
        {remove.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(remove.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            data-initial-focus
            disabled={remove.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('editRelease.keepContributor')}
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="destructive"
          >
            {remove.isPending
              ? t('editRelease.removing')
              : t('workspace.credits.removeContributor')}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}

export function CreditSelfDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: CreditDialogProps) {
  const { t, tMessage } = useI18n()
  const credit = useCreditSelf(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)

  const confirm = async () => {
    try {
      await credit.mutateAsync({ id: release.id, expectedUpdatedAt })
      onSaved()
    } catch {
      // Nothing was credited; the error explains what to do next.
    }
  }

  return (
    <WorkspaceModal
      canClose={!credit.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('workspace.credits.self')}
    >
      <div aria-busy={credit.isPending} className="space-y-6">
        <p>
          <Interpolate
            message={t('editRelease.creditSelf')}
            values={{ name: <strong>{release.artistName}</strong> }}
          />
        </p>
        {credit.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(credit.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={credit.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="artist-workspace-primary"
            data-initial-focus
            disabled={credit.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="primary"
          >
            {credit.isPending
              ? t('editRelease.crediting')
              : t('editRelease.creditMe')}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
