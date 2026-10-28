import { Button } from '@bitrate/ui-react'
import {
  type ReleaseStage,
  type ReleaseWorkspace,
  releaseRoadmap,
} from '@entities/release'
import { ReleaseSubmission } from '@features/submit-release'
import { Link } from '@tanstack/react-router'
import {
  Check,
  CircleCheck,
  CircleDashed,
  Clock,
  Info,
  Send,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { WorkspaceReview } from './WorkspaceReview'

const submittedAt = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

/** What happens to a submitted release, so the artist knows where it stands and what comes next. */
const REVIEW_STEPS = [
  {
    state: 'complete',
    title: 'Submitted',
    detail: 'The draft is locked so the reviewer sees exactly what you sent.',
  },
  {
    state: 'current',
    title: 'Bitrate checks the release',
    detail: 'Audio, artwork, credits and rights.',
  },
  {
    state: 'upcoming',
    title: 'Decision',
    detail:
      'Approved: plan stores and territories. Changes requested: revise and submit again.',
  },
] as const

function StageLink({
  release,
  stage,
  children,
}: {
  release: ReleaseWorkspace
  stage: ReleaseStage
  children: ReactNode
}) {
  return (
    <Button
      asChild
      className="artist-workspace-primary mt-4 w-full rounded-full"
      variant="primary"
    >
      <Link
        params={{ releaseId: release.id }}
        search={{ step: stage }}
        to="/dashboard/music/$releaseId"
      >
        {children}
      </Link>
    </Button>
  )
}

/** What Bitrate checks: the preparation steps, each ready or still open. */
function ReadinessSummary({ release }: { release: ReleaseWorkspace }) {
  const steps = releaseRoadmap(release).filter((step) =>
    ['artwork', 'audio', 'credits', 'rights'].includes(step.key),
  )
  return (
    <ul className="artist-release-summary-list">
      {steps.map((step) => (
        <li data-done={step.state === 'done'} key={step.key}>
          {step.state === 'done' ? (
            <CircleCheck aria-hidden="true" />
          ) : (
            <CircleDashed aria-hidden="true" />
          )}
          <span>{step.label}</span>
          <span>{step.state === 'done' ? 'Ready' : 'Needed'}</span>
        </li>
      ))}
    </ul>
  )
}

interface ReviewStageProps {
  artistId: string
  release: ReleaseWorkspace
}

/** Stage 2: the Bitrate review request, its decision and what to do about it. */
export function ReviewStage({ artistId, release }: ReviewStageProps) {
  const review = release.latestReview
  const { status } = release

  const main =
    status === 'SUBMITTED' ? (
      <section
        aria-labelledby="release-review-heading"
        className="artist-release-workspace-panel artist-release-stage-main"
        data-tone="info"
      >
        <div className="artist-release-status-head">
          <span className="artist-release-status-icon" data-tone="info">
            <Clock aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="release-review-heading">Waiting for a reviewer</h2>
            {release.submittedAt && (
              <p>
                Submitted {submittedAt.format(new Date(release.submittedAt))}{' '}
                UTC
              </p>
            )}
          </div>
          <span className="artist-release-chip" data-tone="info">
            In review
          </span>
        </div>
        <ol aria-label="Review progress" className="artist-release-timeline">
          {REVIEW_STEPS.map((step, index) => (
            <li data-state={step.state} key={step.title}>
              <span aria-hidden="true" className="artist-release-step-mark">
                {step.state === 'complete' ? <Check /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="artist-release-timeline-title">
                  {step.title}
                </span>
                <span>{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="artist-release-honest">
          <Info aria-hidden="true" />
          Nothing is sent to stores while Bitrate reviews the release.
        </p>
        <div className="mt-5">
          <ReleaseSubmission artistId={artistId} release={release} />
        </div>
      </section>
    ) : review ? (
      <WorkspaceReview release={release} />
    ) : (
      <section
        aria-labelledby="release-review-heading"
        className="artist-release-workspace-panel artist-release-stage-main artist-release-empty-stage"
      >
        <Send aria-hidden="true" />
        <h2 id="release-review-heading">Not submitted yet</h2>
        <p>
          Bitrate review starts when you submit the draft. Feedback and the
          decision appear here.
        </p>
      </section>
    )

  const side =
    status === 'REJECTED' ? (
      <section
        aria-labelledby="release-review-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-review-next-heading">Review progress</h2>
        <p>
          {review?.requiredChanges.length ?? 0} required{' '}
          {review?.requiredChanges.length === 1 ? 'change' : 'changes'} before
          resubmitting.
        </p>
        <div className="mt-4">
          <ReleaseSubmission artistId={artistId} release={release} />
        </div>
      </section>
    ) : status === 'READY' || status === 'RELEASED' ? (
      <section
        aria-labelledby="release-review-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-review-next-heading">What happens next</h2>
        <p>
          Approval does not deliver the release. Publish it on Bitrate from
          Launch, and plan stores and territories when you are ready.
        </p>
        <StageLink release={release} stage="deliver">
          Plan delivery
        </StageLink>
      </section>
    ) : (
      <section
        aria-labelledby="release-review-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-review-next-heading">Release readiness</h2>
        <ReadinessSummary release={release} />
        {status === 'DRAFT' && (
          <StageLink release={release} stage="draft">
            Back to the draft
          </StageLink>
        )}
      </section>
    )

  return (
    <div className="artist-release-stage">
      {main}
      {side}
    </div>
  )
}
