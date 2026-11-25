import {
  type AiAllowance,
  type CalendarEntry,
  formatUsd,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { ChartNoAxesColumn } from 'lucide-react'

interface PromotionGlanceProps {
  entries: readonly CalendarEntry[]
  dueThisWeek: number
  allowance: AiAllowance
}

/** The numbers tile: due this week, approved, awaiting the artist, AI spend this month. */
export function PromotionGlance({
  entries,
  dueThisWeek,
  allowance,
}: PromotionGlanceProps) {
  const { t, locale } = useI18n()
  const approved = entries.filter((e) =>
    ['APPROVED', 'EDITED', 'DONE'].includes(e.state),
  ).length
  const awaiting = entries.filter((e) => e.state === 'SUGGESTED').length
  const stats = [
    [t('promotion.page.statThisWeek'), String(dueThisWeek)],
    [t('promotion.page.statApproved'), String(approved)],
    [t('promotion.page.statAwaiting'), String(awaiting)],
    [t('promotion.allowance.title'), formatUsd(allowance.usedMicroUsd, locale)],
  ] as const
  return (
    <section
      aria-labelledby="promotion-glance"
      className="artist-release-workspace-panel"
    >
      <h2 id="promotion-glance">
        <PanelIcon icon={ChartNoAxesColumn} />
        {t('promotion.page.glance')}
      </h2>
      <dl className="artist-promotion-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
