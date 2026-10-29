import { useI18n } from '@shared/i18n'
import { ContributorForm } from './ContributorForm'
import { DraftEditorLoader } from './DraftEditorLoader'

interface AddContributorDialogProps {
  artistId: string
  releaseId: string
  onClose: () => void
  onSaved: () => void
}

export function AddContributorDialog(props: AddContributorDialogProps) {
  const { t } = useI18n()
  return (
    <DraftEditorLoader
      artistId={props.artistId}
      onClose={props.onClose}
      releaseId={props.releaseId}
      renderDraft={(release) => (
        <ContributorForm {...props} release={release} />
      )}
      title={t('workspace.credits.add')}
    />
  )
}
