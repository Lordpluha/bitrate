import type { ArtistAnalytics } from '@entities/analytics'
import { useI18n } from '@shared/i18n'
import { useFormats } from '../lib/useFormats'

export function DailyTable({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  const format = useFormats()
  return (
    <details className="artist-analytics-table">
      <summary>{t('analytics.showTable')}</summary>
      <section
        aria-label={t('analytics.tableCaption')}
        className="artist-analytics-table-scroll"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll the table.
        tabIndex={0}
      >
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">{t('analytics.tableCaption')}</caption>
          <thead>
            <tr className="text-left text-text-secondary">
              <th className="py-1 font-normal" scope="col">
                {t('analytics.dayUtc')}
              </th>
              <th className="py-1 text-right font-normal" scope="col">
                {t('analytics.plays')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.daily.map((day) => (
              <tr className="border-t border-border" key={day.date}>
                <td className="py-1">{format.day(day.date)}</td>
                <td className="py-1 text-right tabular-nums">
                  {format.number(day.plays)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </details>
  )
}
