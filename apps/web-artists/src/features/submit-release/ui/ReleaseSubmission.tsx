import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useReviseRelease,
  useSubmitRelease,
  useWithdrawRelease,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useId, useState } from 'react'

interface ReleaseSubmissionProps {
  artistId: string
  release: ReleaseWorkspace
}

/** Creates, withdraws or reopens a Bitrate review request; never starts external delivery. */
export function ReleaseSubmission({
  artistId,
  release,
}: ReleaseSubmissionProps) {
  const { tMessage } = useI18n()
  const id = useId()
  const submit = useSubmitRelease(artistId)
  const withdraw = useWithdrawRelease(artistId)
  const revise = useReviseRelease(artistId)
  const [reviewed, setReviewed] = useState(false)
  const blockers = release.readiness.blockers.length
  const expectedUpdatedAt = release.updatedAt

  if (release.status === 'SUBMITTED')
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button
            className="rounded-full"
            disabled={withdraw.isPending}
            onClick={() => {
              withdraw.mutate({ id: release.id, input: { expectedUpdatedAt } })
            }}
            variant="outline"
          >
            {withdraw.isPending ? 'Withdrawing…' : 'Withdraw from review'}
          </Button>
          <p className="text-sm text-text-secondary">
            Need a change? Withdrawing returns it to the draft; nothing saved is
            lost.
          </p>
        </div>
        {withdraw.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(withdraw.error.message)}
          </p>
        )}
      </div>
    )

  if (release.status === 'REJECTED')
    return (
      <div className="space-y-3">
        <p className="font-medium" role="status">
          Bitrate requested changes. Reopen the draft to address them, then
          submit again.
        </p>
        <Button
          className="artist-workspace-primary rounded-full"
          disabled={revise.isPending}
          onClick={() => {
            revise.mutate({ id: release.id, input: { expectedUpdatedAt } })
          }}
          variant="primary"
        >
          {revise.isPending ? 'Reopening…' : 'Start revising'}
        </Button>
        {revise.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(revise.error.message)}
          </p>
        )}
      </div>
    )

  if (release.status === 'READY')
    return (
      <p className="font-medium" role="status">
        Approved by Bitrate review. Delivery follows the plan below.
      </p>
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
        <span>
          I checked this draft and confirm the information is accurate.
        </span>
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
          {tMessage(submit.error.message)}
        </p>
      )}
    </form>
  )
}
