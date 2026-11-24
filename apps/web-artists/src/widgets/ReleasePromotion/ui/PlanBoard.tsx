import {
  type AiAllowance,
  AiMarker,
  type PromotionPlan,
  type PromotionProfile,
  phaseLabels,
  stepsByPhase,
  useRequestPlan,
} from '@entities/promotion'
import { PlanStepRow } from '@features/promotion-plan'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { PanelIcon } from '@shared/ui'
import { Hourglass, Rocket, TrendingUp, TriangleAlert } from 'lucide-react'
import { AllowanceCard } from './AllowanceCard'
import { PlanSummary } from './PlanSummary'
import { ProfileCard } from './ProfileCard'
import { PromotionPromise } from './PromotionPromise'

const PHASE_ICONS = { PRE: Hourglass, LAUNCH: Rocket, POST: TrendingUp }

interface PlanBoardProps {
  artistId: string
  releaseId: string
  plan: PromotionPlan
  profile: PromotionProfile
  allowance: AiAllowance
  onOpenPosts: (stepId: string) => void
}

/** A generated plan: dated steps by phase on the main column, summary and allowance beside. */
export function PlanBoard({
  artistId,
  releaseId,
  plan,
  profile,
  allowance,
  onOpenPosts,
}: PlanBoardProps) {
  const { t, tMessage, locale } = useI18n()
  const request = useRequestPlan(artistId, releaseId)
  const canGenerate = allowance.usedMicroUsd < allowance.limitMicroUsd
  return (
    <div className="artist-release-stage">
      <div className="artist-release-stage-main grid gap-4">
        {!canGenerate && (
          <section
            className="artist-release-workspace-panel"
            data-tone="warning"
            role="status"
          >
            <h2>
              <PanelIcon icon={TriangleAlert} />
              {t('promotion.quota.title')}
            </h2>
            <p>
              {t('promotion.quota.description', {
                date: formatDateTimeUtc(allowance.resetsAt, locale),
              })}
            </p>
          </section>
        )}
        <div className="artist-promotion-actions">
          <AiMarker />
          <span className="artist-release-chip">
            {t('promotion.stage.version', { version: plan.version })}
          </span>
          <span className="artist-promotion-step-meta">
            {t('promotion.stage.generatedFrom')}
          </span>
        </div>
        {stepsByPhase(plan).map(({ phase, steps }) => (
          <section
            aria-labelledby={`promotion-phase-${phase}`}
            className="artist-release-workspace-panel"
            key={phase}
          >
            <h2 id={`promotion-phase-${phase}`}>
              <PanelIcon icon={PHASE_ICONS[phase]} />
              {t(phaseLabels[phase])}
            </h2>
            <ol className="artist-promotion-steps">
              {steps.map((step) => (
                <PlanStepRow
                  artistId={artistId}
                  canGenerate={canGenerate}
                  key={step.id}
                  onOpenPosts={onOpenPosts}
                  releaseId={releaseId}
                  step={step}
                />
              ))}
            </ol>
          </section>
        ))}
        {request.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(request.error.message)}
          </p>
        )}
      </div>
      <div className="artist-release-stage-side artist-promotion-side">
        <PlanSummary
          canGenerate={canGenerate}
          onRegenerate={() => request.mutate()}
          plan={plan}
          regenerating={request.isPending}
        />
        <ProfileCard profile={profile} />
        <AllowanceCard allowance={allowance} />
        <PromotionPromise />
      </div>
    </div>
  )
}
