import { Button, Input } from '@bitrate/ui-react'
import { type PromotionStep, useRegenerateStep } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { RefreshCw } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'

interface StepRegenerateFormProps {
  artistId: string
  releaseId: string
  step: PromotionStep
  onClose: () => void
}

/** Asks AI for a new take on one suggested step, optionally steered by a hint. */
export function StepRegenerateForm({
  artistId,
  releaseId,
  step,
  onClose,
}: StepRegenerateFormProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const regenerate = useRegenerateStep(artistId, releaseId)
  const [hint, setHint] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await regenerate.mutateAsync({
        stepId: step.id,
        hint: hint.trim() || undefined,
      })
      onClose()
    } catch {
      // The error stays on screen with the hint.
    }
  }
  return (
    <form
      aria-busy={regenerate.isPending}
      className="grid gap-3"
      onSubmit={submit}
    >
      <label className="grid gap-1 text-sm" htmlFor={`${id}-hint`}>
        {t('promotion.step.regenerateHint')}
        <Input
          id={`${id}-hint`}
          maxLength={200}
          onChange={(event) => setHint(event.target.value)}
          placeholder={t('promotion.step.regenerateHintPlaceholder')}
          value={hint}
        />
      </label>
      {regenerate.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(regenerate.error.message)}
        </p>
      )}
      <div className="artist-promotion-actions">
        <Button disabled={regenerate.isPending} size="sm" type="submit">
          <RefreshCw aria-hidden="true" />
          {t('promotion.step.regenerate')}
        </Button>
        <Button onClick={onClose} size="sm" type="button" variant="ghost">
          {t('promotion.step.cancel')}
        </Button>
      </div>
    </form>
  )
}
