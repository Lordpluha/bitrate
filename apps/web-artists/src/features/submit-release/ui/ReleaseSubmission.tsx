import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useSubmitRelease,
  useWithdrawRelease,
} from '@entities/release'
import { useId, useState } from 'react'

interface ReleaseSubmissionProps {
  artistId: string
  release: ReleaseWorkspace
}

/** Creates or withdraws a Bitrate review request; never starts external delivery. */
export function ReleaseSubmission({
  artistId,
  release,
}: ReleaseSubmissionProps) {
  const id = useId()
  const submit = useSubmitRelease(artistId)
  const withdraw = useWithdrawRelease(artistId)
  const [reviewed, setReviewed] = useState(false)
  const blockers = release.readiness.blockers.length
  const expectedUpdatedAt = release.updatedAt

  if (release.status === 'SUBMITTED')
    return (
      <div className="space-y-3">
        <p className="font-medium" role="status">
          Submitted for Bitrate review. External delivery has not started.
        </p>
        <Button
          disabled={withdraw.isPending}
          onClick={() => {
            withdraw.mutate({ id: release.id, input: { expectedUpdatedAt } })
          }}
          variant="outline"
        >
          {withdraw.isPending ? 'Withdrawing…' : 'Withdraw from review'}
        </Button>
        <p className="text-sm text-text-secondary">
          Withdrawing returns the release to its draft; saved details are kept.
        </p>
        {withdraw.error && (
          <p className="text-sm text-destructive" role="alert">
            {withdraw.error.message}
          </p>
        )}
      </div>
    )

  if (release.status !== 'DRAFT') return null

  return (
    <form
      aria-busy={submit.isPending}
      className="space-y-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit.mutate({
          id: release.id,
          input: { reviewed: true, expectedUpdatedAt },
        })
      }}
    >
      <label className="artist-release-credit-role">
        <input
          aria-describedby={`${id}-hint`}
          checked={reviewed}
          disabled={submit.isPending}
          onChange={(event) => {
            submit.reset()
            setReviewed(event.target.checked)
          }}
          type="checkbox"
        />
        <span>I reviewed the information in this draft.</span>
      </label>
      <Button
        className="artist-workspace-primary rounded-full"
        disabled={submit.isPending || blockers > 0 || !reviewed}
        type="submit"
        variant="primary"
      >
        {submit.isPending ? 'Submitting…' : 'Submit for review'}
      </Button>
      <p className="text-sm text-text-secondary" id={`${id}-hint`}>
        {blockers > 0
          ? `Resolve ${blockers} ${blockers === 1 ? 'blocker' : 'blockers'} before submission.`
          : 'Creates a Bitrate review request only. It does not deliver this release to streaming services.'}
      </p>
      {submit.error && (
        <p className="text-sm text-destructive" role="alert">
          {submit.error.message}
        </p>
      )}
    </form>
  )
}
