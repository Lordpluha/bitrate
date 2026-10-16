import type { ReleaseWorkspace } from '@entities/release'
import { CircleAlert, CircleCheck, Lightbulb } from 'lucide-react'

const reviewDate = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

interface WorkspaceReviewProps {
  release: ReleaseWorkspace
}

/** The latest Bitrate review decision; required changes stay visible while revising. */
export function WorkspaceReview({ release }: WorkspaceReviewProps) {
  const review = release.latestReview
  if (!review) return null
  // A resubmitted release is waiting on a new decision, so the old one is history.
  if (release.status === 'SUBMITTED') return null
  const approved = review.decision === 'APPROVED'
  return (
    <section
      aria-labelledby="release-review-heading"
      className="artist-release-workspace-panel space-y-4"
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
          {approved ? 'Approved by Bitrate' : 'Changes requested'}
        </h2>
        <p className="text-xs text-text-secondary">
          Reviewed {reviewDate.format(new Date(review.createdAt))} UTC
        </p>
      </div>
      {review.message && (
        <p className="whitespace-pre-line text-sm">{review.message}</p>
      )}
      {review.requiredChanges.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Required before resubmitting</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {review.requiredChanges.map((change) => (
              // Bitrate rejects duplicate review items, so the text is unique.
              <li key={change}>{change}</li>
            ))}
          </ol>
        </div>
      )}
      {review.recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recommendations</h3>
          <ul className="space-y-1 text-sm text-text-secondary">
            {review.recommendations.map((item) => (
              <li className="flex items-start gap-2" key={item}>
                <Lightbulb
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-accent"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
