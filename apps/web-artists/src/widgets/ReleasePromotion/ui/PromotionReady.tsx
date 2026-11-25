import { Button } from '@bitrate/ui-react'
import { type AiAllowance, useRequestPlan } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Sparkles } from 'lucide-react'
import { AllowanceCard } from './AllowanceCard'
import { PromotionPromise } from './PromotionPromise'

interface PromotionReadyProps {
  artistId: string
  releaseId: string
  releaseTitle: string
  allowance: AiAllowance
}

/** A dated release with a profile and no plan yet: one action generates the first version. */
export function PromotionReady({
  artistId,
  releaseId,
  releaseTitle,
  allowance,
}: PromotionReadyProps) {
  const { t, tMessage } = useI18n()
  const request = useRequestPlan(artistId, releaseId)
  const canGenerate = allowance.usedMicroUsd < allowance.limitMicroUsd
  return (
    <div className="artist-release-stage">
      <section
        aria-labelledby="promotion-ready-heading"
        className="artist-release-workspace-panel artist-release-stage-main"
        data-tone="info"
      >
        <h2 id="promotion-ready-heading">
          <PanelIcon icon={Sparkles} />
          {t('promotion.stage.title')}
        </h2>
        <p className="mt-3 text-xl">
          {t('promotion.ready.title', { title: releaseTitle })}
        </p>
        <p className="mt-2">{t('promotion.ready.description')}</p>
        <Button
          className="mt-5"
          disabled={!canGenerate || request.isPending}
          onClick={() => request.mutate()}
        >
          <Sparkles aria-hidden="true" />
          {t('promotion.ready.action')}
        </Button>
        <p className="artist-release-footnote">
          {canGenerate ? t('promotion.ready.cost') : t('promotion.quota.title')}
        </p>
        {request.error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {tMessage(request.error.message)}
          </p>
        )}
      </section>
      <div className="artist-release-stage-side artist-promotion-side">
        <AllowanceCard allowance={allowance} />
        <PromotionPromise />
      </div>
    </div>
  )
}
