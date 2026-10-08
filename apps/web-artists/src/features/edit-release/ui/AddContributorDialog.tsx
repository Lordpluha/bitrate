import { ContributorForm } from './ContributorForm'
import { DraftEditorLoader } from './DraftEditorLoader'

interface AddContributorDialogProps {
  artistId: string
  releaseId: string
  onClose: () => void
  onSaved: () => void
}

export function AddContributorDialog(props: AddContributorDialogProps) {
  return (
    <DraftEditorLoader
      artistId={props.artistId}
      onClose={props.onClose}
      releaseId={props.releaseId}
      renderDraft={(release) => (
        <ContributorForm {...props} release={release} />
      )}
      title="Add contributor"
    />
  )
}
