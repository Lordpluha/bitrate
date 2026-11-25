import { Button, Input, Textarea } from '@bitrate/ui-react'
import { type PromotionStep, useUpdateStep } from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { type FormEvent, useId, useState } from 'react'

interface StepEditFormProps {
  artistId: string
  releaseId: string
  step: PromotionStep
  onClose: () => void
}

/** Rewrites a step by hand; the step becomes the artist's own and loses the AI marker. */
export function StepEditForm({
  artistId,
  releaseId,
  step,
  onClose,
}: StepEditFormProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const update = useUpdateStep(artistId, releaseId)
  const [title, setTitle] = useState(step.title)
  const [body, setBody] = useState(step.body)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await update.mutateAsync({
        stepId: step.id,
        input: { action: 'edit', title: title.trim(), body: body.trim() },
      })
      onClose()
    } catch {
      // The error stays on screen with the entries.
    }
  }
  return (
    <form aria-busy={update.isPending} className="grid gap-3" onSubmit={submit}>
      <label className="grid gap-1 text-sm" htmlFor={`${id}-title`}>
        {t('promotion.step.titleLabel')}
        <Input
          id={`${id}-title`}
          maxLength={120}
          minLength={3}
          onChange={(event) => setTitle(event.target.value)}
          required
          value={title}
        />
      </label>
      <label className="grid gap-1 text-sm" htmlFor={`${id}-body`}>
        {t('promotion.step.bodyLabel')}
        <Textarea
          id={`${id}-body`}
          maxLength={600}
          onChange={(event) => setBody(event.target.value)}
          required
          rows={4}
          value={body}
        />
      </label>
      {update.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(update.error.message)}
        </p>
      )}
      <div className="artist-promotion-actions">
        <Button disabled={update.isPending} size="sm" type="submit">
          {t('promotion.step.save')}
        </Button>
        <Button onClick={onClose} size="sm" type="button" variant="ghost">
          {t('promotion.step.cancel')}
        </Button>
      </div>
    </form>
  )
}
