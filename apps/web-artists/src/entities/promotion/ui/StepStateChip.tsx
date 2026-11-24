import { useI18n } from '@shared/i18n'
import type { StepState } from '../model/promotion.schema'
import { stepStateLabels, stepStateTone } from '../model/promotionLabels'

export function StepStateChip({ state }: { state: StepState }) {
  const { t } = useI18n()
  return (
    <span className="artist-release-chip" data-tone={stepStateTone[state]}>
      {t(stepStateLabels[state])}
    </span>
  )
}
