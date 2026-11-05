import type { DashboardAttention } from '@entities/dashboard'
import type { I18n } from '@shared/i18n'

/** The title and explanation of one item that needs the artist. */
export function attentionCopy(
  item: DashboardAttention,
  { t, tp }: Pick<I18n, 't' | 'tp'>,
) {
  switch (item.kind) {
    case 'BLOCKERS':
      return {
        title: tp({
          count: item.count ?? 0,
          key: 'dashboard.attention.blockers',
          values: {
            title: item.releaseTitle ?? t('dashboard.attention.aDraft'),
          },
        }),
        detail: t('dashboard.attention.requiredBefore'),
      }
    case 'CHANGES_REQUESTED':
      return {
        title: t('dashboard.attention.changes', {
          title: item.releaseTitle ?? t('dashboard.attention.aRelease'),
        }),
        detail: t('dashboard.attention.feedback'),
      }
  }
}
