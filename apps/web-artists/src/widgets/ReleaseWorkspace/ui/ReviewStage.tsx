import { Button } from '@bitrate/ui-react'
import {
  type ReleaseStage,
  type ReleaseWorkspace,
  releaseRoadmap,
} from '@entities/release'
import { ReleaseSubmission } from '@features/submit-release'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
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

/** What happens to a submitted release, so the artist knows where it stands and what comes next. */
const REVIEW_STEPS = [
  {
    state: 'complete',
    title: 'workspace.review.stepSubmitted',
    detail: 'workspace.review.stepSubmittedDetail',
  },
  {
    state: 'current',
    title: 'workspace.review.stepChecks',
    detail: 'workspace.review.stepChecksDetail',
  },
  {
    state: 'upcoming',
    title: 'workspace.review.stepDecision',
    detail: 'workspace.review.stepDecisionDetail',
  },
] as const satisfies readonly {
  state: string
  title: TranslationKey
  detail: TranslationKey
}[]

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
  const i18n = useI18n()
  const { t } = i18n
  const steps = releaseRoadmap(release, i18n).filter((step) =>
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
          <span>
            {step.state === 'done'
              ? t('workspace.ready')
              : t('workspace.needed')}
          </span>
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
  const { t, tp, locale } = useI18n()

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
            <h2 id="release-review-heading">{t('workspace.review.waiting')}</h2>
            {release.submittedAt && (
              <p>
                {t('workspace.review.submittedAt', {
                  date: formatDateTimeUtc(release.submittedAt, locale),
                })}
              </p>
            )}
          </div>
          <span className="artist-release-chip" data-tone="info">
            {t('labels.releaseStatus.inReview')}
          </span>
        </div>
        <ol
          aria-label={t('workspace.review.progress')}
          className="artist-release-timeline"
        >
          {REVIEW_STEPS.map((step, index) => (
            <li data-state={step.state} key={step.title}>
              <span aria-hidden="true" className="artist-release-step-mark">
                {step.state === 'complete' ? <Check /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="artist-release-timeline-title">
                  {t(step.title)}
                </span>
                <span>{t(step.detail)}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="artist-release-honest">
          <Info aria-hidden="true" />
          {t('workspace.review.honest')}
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
        <h2 id="release-review-heading">
          {t('workspace.review.notSubmitted')}
        </h2>
        <p>{t('workspace.review.notSubmittedHint')}</p>
      </section>
    )

  const side =
    status === 'REJECTED' ? (
      <section
        aria-labelledby="release-review-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-review-next-heading">
          {t('workspace.review.progress')}
        </h2>
        <p>
          {tp({
            count: review?.requiredChanges.length ?? 0,
            key: 'workspace.review.requiredChanges',
          })}
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
        <h2 id="release-review-next-heading">{t('workspace.whatNext')}</h2>
        <p>{t('workspace.review.nextHint')}</p>
        <StageLink release={release} stage="deliver">
          {t('workspace.review.planDelivery')}
        </StageLink>
      </section>
    ) : (
      <section
        aria-labelledby="release-review-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-review-next-heading">
          {t('workspace.review.readiness')}
        </h2>
        <ReadinessSummary release={release} />
        {status === 'DRAFT' && (
          <StageLink release={release} stage="draft">
            {t('workspace.review.backToDraft')}
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
