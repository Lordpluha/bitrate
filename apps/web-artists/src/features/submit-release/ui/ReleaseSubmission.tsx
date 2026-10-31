import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useReviseRelease,
  useWithdrawRelease,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useState } from 'react'
import { SubmitPreviewDialog } from './SubmitPreviewDialog'

interface ReleaseSubmissionProps {
  artistId: string
  release: ReleaseWorkspace
  /** Opens the page's submit preview; without it this block opens its own. */
  onReview?: () => void
}

/** Creates, withdraws or reopens a Bitrate review request; never starts external delivery. */
export function ReleaseSubmission({
  artistId,
  release,
  onReview,
}: ReleaseSubmissionProps) {
  const { t, tMessage, tp } = useI18n()
  const withdraw = useWithdrawRelease(artistId)
  const revise = useReviseRelease(artistId)
  const [previewing, setPreviewing] = useState(false)
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
    <div className="space-y-3">
      <Button
        className="artist-workspace-primary rounded-full"
        disabled={blockers > 0}
        onClick={() => (onReview ? onReview() : setPreviewing(true))}
        variant="primary"
      >
        {t('publish.review')}
      </Button>
      <p className="text-sm text-text-secondary">
        {blockers > 0
          ? tp({ count: blockers, key: 'publish.blockers' })
          : t('publish.submitHint')}
      </p>
      {previewing && (
        <SubmitPreviewDialog
          artistId={artistId}
          onClose={() => setPreviewing(false)}
          release={release}
        />
      )}
    </div>
  )
}
