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
  const { t, tMessage, tp } = useI18n()
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
            {withdraw.isPending
              ? t('publish.withdrawing')
              : t('publish.withdraw')}
          </Button>
          <p className="text-sm text-text-secondary">
            {t('publish.withdrawHint')}
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
          {t('publish.changesRequested')}
        </p>
        <Button
          className="artist-workspace-primary rounded-full"
          disabled={revise.isPending}
          onClick={() => {
            revise.mutate({ id: release.id, input: { expectedUpdatedAt } })
          }}
          variant="primary"
        >
          {revise.isPending
            ? t('publish.reopening')
            : t('publish.startRevising')}
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
        {t('publish.approvedReview')}
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
        <span>{t('publish.confirmAccurate')}</span>
      </label>
      <Button
        className="artist-workspace-primary rounded-full"
        disabled={submit.isPending || blockers > 0 || !reviewed}
        type="submit"
        variant="primary"
      >
        {submit.isPending ? t('publish.submitting') : t('publish.submit')}
      </Button>
      <p className="text-sm text-text-secondary" id={`${id}-hint`}>
        {blockers > 0
          ? tp({ count: blockers, key: 'publish.blockers' })
          : t('publish.submitHint')}
      </p>
      {submit.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(submit.error.message)}
        </p>
      )}
    </form>
  )
}
