import { cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import type { ReleaseSummary } from '../model/release.schema'
import {
  currentStage,
  releasePipeline,
  releaseStageLabels,
  stageProgress,
} from '../model/stages'

/** Circumference of the ring's circle (r = 52), for the dash arithmetic. */
const CIRCUMFERENCE = 2 * Math.PI * 52
/** Gap between segments, in the same units. */
const GAP = 10

interface StageRingProps {
  status: ReleaseSummary['status']
  className?: string
}

/**
 * The four release stages as a ring of segments: finished ones solid, the current one in the
 * accent. The centre names the current stage.
 */
export function StageRing({ status, className }: StageRingProps) {
  const { t } = useI18n()
  const progress = stageProgress(status)
  const current = currentStage(status)
  const index = releasePipeline.indexOf(current) + 1
  const segment = CIRCUMFERENCE / releasePipeline.length
  return (
    <div
      aria-label={t('release.ring.label', {
        stage: t(releaseStageLabels[current]),
        index,
        total: releasePipeline.length,
      })}
      className={cn('artist-stage-ring', className)}
      role="img"
    >
      <svg aria-hidden="true" viewBox="0 0 120 120">
        {releasePipeline.map((stage, position) => (
          <circle
            cx="60"
            cy="60"
            data-progress={progress[stage]}
            fill="none"
            key={stage}
            r="52"
            strokeDasharray={`${segment - GAP} ${CIRCUMFERENCE - segment + GAP}`}
            strokeDashoffset={-position * segment}
            strokeLinecap="round"
            strokeWidth="9"
          />
        ))}
      </svg>
      <span aria-hidden="true" className="artist-stage-ring-centre">
        <b>
          {index}/{releasePipeline.length}
        </b>
        <span>{t(releaseStageLabels[current])}</span>
      </span>
    </div>
  )
}
