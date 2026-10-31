import type { ReleaseWorkspace } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { MarkdownText } from '@shared/ui'
import { CircleAlert, CircleCheck } from 'lucide-react'

interface WorkspaceReviewProps {
  release: ReleaseWorkspace
}

/** The latest Bitrate review decision; its feedback stays visible while revising. */
export function WorkspaceReview({ release }: WorkspaceReviewProps) {
  const { t, locale } = useI18n()
  const review = release.latestReview
  if (!review) return null
  // A resubmitted release is waiting on a new decision, so the old one is history.
  if (release.status === 'SUBMITTED') return null
  const approved = review.decision === 'APPROVED'
  return (
    <section
      aria-labelledby="release-review-heading"
      className="artist-release-workspace-panel artist-release-stage-main space-y-4"
      data-tone={approved ? 'success' : 'warning'}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2" id="release-review-heading">
          {approved ? (
            <CircleCheck aria-hidden="true" className="size-5 text-accent" />
          ) : (
            <CircleAlert
              aria-hidden="true"
              className="size-5 text-destructive"
            />
          )}
          {approved
            ? t('workspace.review.approved')
            : t('workspace.review.changesRequested')}
        </h2>
        <p className="text-xs text-text-secondary">
          {t('workspace.review.reviewedAt', {
            date: formatDateTimeUtc(review.createdAt, locale),
          })}
        </p>
      </div>
      {review.message && <MarkdownText>{review.message}</MarkdownText>}
    </section>
  )
}
