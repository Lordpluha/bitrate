import { type AiAllowance, formatUsd } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { PanelIcon } from '@shared/ui'
import { Gauge } from 'lucide-react'

interface AllowanceCardProps {
  allowance: AiAllowance
}

export function AllowanceCard({ allowance }: AllowanceCardProps) {
  const { t, locale } = useI18n()
  const share = Math.min(
    100,
    Math.round((allowance.usedMicroUsd / allowance.limitMicroUsd) * 100),
  )
  const values = {
    used: formatUsd(allowance.usedMicroUsd, locale),
    limit: formatUsd(allowance.limitMicroUsd, locale),
  }
  return (
    <section className="artist-release-workspace-panel">
      <h2>
        <PanelIcon icon={Gauge} />
        {t('promotion.allowance.title')}
      </h2>
      <dl className="artist-promotion-kv">
        <div>
          <dt>{t('promotion.allowance.thisMonth')}</dt>
          <dd>{t('promotion.allowance.value', values)}</dd>
        </div>
      </dl>
      <meter
        aria-label={t('promotion.allowance.value', values)}
        className="artist-promotion-meter"
        data-full={share >= 100}
        max={100}
        min={0}
        value={share}
      />
      <p className="artist-release-footnote">
        {t('promotion.allowance.resets', {
          date: formatDateTimeUtc(allowance.resetsAt, locale),
        })}
      </p>
    </section>
  )
}
