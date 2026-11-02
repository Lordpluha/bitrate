import { Button } from '@bitrate/ui-react'
import { type ReleaseSummary, useRelease } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import type { ReactNode } from 'react'

interface DraftEditorLoaderProps {
  artistId: string
  releaseId: string
  title: string
  /** Statuses this editor accepts; most edits are draft-only. */
  statuses?: readonly ReleaseSummary['status'][]
  onClose: () => void
  renderDraft: (release: ReleaseSummary) => ReactNode
}

const DRAFT_ONLY = ['DRAFT'] as const

export function DraftEditorLoader({
  artistId,
  releaseId,
  title,
  statuses = DRAFT_ONLY,
  onClose,
  renderDraft,
}: DraftEditorLoaderProps) {
  const { t, tMessage } = useI18n()
  const query = useRelease(artistId, releaseId)
  if (
    query.data &&
    statuses.includes(query.data.status) &&
    !query.isPending &&
    !query.isError
  )
    return renderDraft(query.data)
  return (
    <WorkspaceModal onClose={onClose} title={title}>
      {query.isPending ? (
        <p role="status">{t('editRelease.loadingDraft')}</p>
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
        <p role="alert">{t('editRelease.notEditable')}</p>
      )}
    </WorkspaceModal>
  )
}
