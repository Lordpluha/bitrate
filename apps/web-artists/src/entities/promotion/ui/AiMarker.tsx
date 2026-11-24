import { useI18n } from '@shared/i18n'
import { Sparkles } from 'lucide-react'

/** The visible "Created with AI" marker every AI-written item carries (spec AC-9). */
export function AiMarker() {
  const { t } = useI18n()
  return (
    <span className="artist-promotion-ai">
      <Sparkles aria-hidden="true" />
      {t('promotion.ai')}
    </span>
  )
}
