import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Info } from 'lucide-react'

export function PromotionPromise() {
  const { t } = useI18n()
  return (
    <section className="artist-release-workspace-panel">
      <h2>
        <PanelIcon icon={Info} />
        {t('promotion.promise.title')}
      </h2>
      <p>{t('promotion.promise.description')}</p>
    </section>
  )
}
