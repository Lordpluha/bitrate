import { Button } from '@bitrate/ui-react'
import { type PromotionPlan, planCounts } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { PanelIcon } from '@shared/ui'
import { ListChecks, RefreshCw } from 'lucide-react'

/** The plan summary with the regenerate action; it replaces only suggested steps. */
interface PlanSummaryProps {
  plan: PromotionPlan
  canGenerate: boolean
  regenerating: boolean
  onRegenerate: () => void
}

export function PlanSummary({
  plan,
  canGenerate,
  regenerating,
  onRegenerate,
}: PlanSummaryProps) {
  const { t, locale } = useI18n()
  const counts = planCounts(plan)
  return (
    <section className="artist-release-workspace-panel" data-tone="info">
      <h2>
        <PanelIcon icon={ListChecks} />
        {t('promotion.summary.title')}
      </h2>
      <dl className="artist-promotion-kv">
        {plan.releaseDate && (
          <div>
            <dt>{t('promotion.summary.releaseDate')}</dt>
            <dd>{formatDateTimeUtc(plan.releaseDate, locale)} UTC</dd>
          </div>
        )}
        <div>
          <dt>{t('promotion.summary.steps')}</dt>
          <dd>{t('promotion.summary.stepsValue', counts)}</dd>
        </div>
        <div>
          <dt>{t('promotion.summary.awaiting')}</dt>
          <dd>{counts.suggested}</dd>
        </div>
      </dl>
      <Button
        className="mt-4 w-full"
        disabled={!canGenerate || regenerating}
        onClick={onRegenerate}
        variant="outline"
      >
        <RefreshCw aria-hidden="true" />
        {t('promotion.summary.regenerate')}
      </Button>
      <p className="artist-release-footnote">
        {t('promotion.summary.regenerateNote')}
      </p>
    </section>
  )
}
