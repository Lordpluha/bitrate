import type { ArtistAnalytics } from '@entities/analytics'
import { destinationLabels } from '@shared/constants/destinations'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { PlugZap } from 'lucide-react'

export function ExternalSources({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  return (
    <section
      aria-labelledby="analytics-external-heading"
      className="artist-release-workspace-panel"
    >
      <h2 id="analytics-external-heading">
        <PanelIcon icon={PlugZap} />
        {t('analytics.other')}
      </h2>
      <ul className="mt-3 divide-y divide-border">
        {data.external.map((item) => (
          <li
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
            key={item.source}
          >
            <span>{destinationLabels[item.source]}</span>
            <span className="artist-release-chip">
              <PlugZap aria-hidden="true" />
              {t('delivery.availability.notConnected')}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3">{t('analytics.noFigures')}</p>
    </section>
  )
}
