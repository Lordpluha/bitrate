import { Button } from '@bitrate/ui-react'
import {
  AiMarker,
  channelNames,
  formatStepDay,
  kindLabels,
  offsetLabel,
  type PromotionStep,
  StepStateChip,
  useUpdateStep,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { ArrowUpRight, Check, Pencil, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import { StepEditForm } from './StepEditForm'
import { StepRegenerateForm } from './StepRegenerateForm'

interface PlanStepRowProps {
  artistId: string
  releaseId: string
  step: PromotionStep
  /** False once the monthly allowance is used: new AI text waits for the reset. */
  canGenerate: boolean
  onOpenPosts: (stepId: string) => void
}

type Mode = 'view' | 'edit' | 'regenerate'

/** What a Bitrate-internal step does once approved; other kinds need no note. */
const noteFor = (kind: PromotionStep['kind']) => {
  if (kind === 'FOLLOWER_MESSAGE') return 'promotion.step.followerNote' as const
  if (kind === 'COUNTDOWN') return 'promotion.step.countdownNote' as const
  return null
}

/** One dated step of the plan with the artist's approve / edit / reject / done actions (spec D-3). */
export function PlanStepRow({
  artistId,
  releaseId,
  step,
  canGenerate,
  onOpenPosts,
}: PlanStepRowProps) {
  const { t, tMessage, locale } = useI18n()
  const update = useUpdateStep(artistId, releaseId)
  const [mode, setMode] = useState<Mode>('view')
  const act = (action: 'approve' | 'reject' | 'done') =>
    update.mutate({ stepId: step.id, input: { action } })
  const open = step.state === 'APPROVED' || step.state === 'EDITED'
  const day = step.dueAt ? ` · ${formatStepDay(step.dueAt, locale)}` : ''
  const channels = step.channels.map((c) => channelNames[c]).join(', ')
  const note = noteFor(step.kind)
  const busy = update.isPending || step.regenerating
  return (
    <li className="artist-promotion-step" data-state={step.state}>
      <div className="artist-promotion-step-head">
        <span className="grid gap-1">
          <span className="artist-release-row-title">
            {offsetLabel(step.offsetDays)}
            {day} — {step.title}
          </span>
          <span className="artist-promotion-step-meta">
            {t(kindLabels[step.kind])}
            {channels && ` · ${channels}`}
          </span>
        </span>
        <StepStateChip state={step.state} />
      </div>
      {mode === 'edit' ? (
        <StepEditForm
          {...{ artistId, releaseId, step }}
          onClose={() => setMode('view')}
        />
      ) : (
        <p className="artist-promotion-step-body">{step.body}</p>
      )}
      {mode === 'regenerate' && (
        <StepRegenerateForm
          {...{ artistId, releaseId, step }}
          onClose={() => setMode('view')}
        />
      )}
      {note && <p className="artist-promotion-step-meta">{t(note)}</p>}
      {step.aiGenerated && <AiMarker />}
      {step.regenerating && (
        <p className="artist-promotion-step-meta" role="status">
          {t('promotion.step.regenerating')}
        </p>
      )}
      {(step.regenerationFailure || update.error) && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(
            update.error?.message ?? step.regenerationFailure ?? undefined,
          )}
        </p>
      )}
      {mode === 'view' && !step.regenerating && (
        <div className="artist-promotion-actions">
          {step.state === 'SUGGESTED' && (
            <Button
              disabled={busy}
              onClick={() => act('approve')}
              size="sm"
              variant="outline"
            >
              <Check aria-hidden="true" />
              {t('promotion.step.approve')}
            </Button>
          )}
          {(step.state === 'SUGGESTED' || open) && (
            <Button
              disabled={busy}
              onClick={() => setMode('edit')}
              size="sm"
              variant="ghost"
            >
              <Pencil aria-hidden="true" />
              {t('promotion.step.edit')}
            </Button>
          )}
          {step.state === 'SUGGESTED' && canGenerate && (
            <Button
              disabled={busy}
              onClick={() => setMode('regenerate')}
              size="sm"
              variant="ghost"
            >
              <RefreshCw aria-hidden="true" />
              {t('promotion.step.regenerate')}
            </Button>
          )}
          {(step.state === 'SUGGESTED' || open) && (
            <Button
              disabled={busy}
              onClick={() => act('reject')}
              size="sm"
              variant="ghost"
            >
              <X aria-hidden="true" />
              {t('promotion.step.reject')}
            </Button>
          )}
          {open && (
            <Button
              disabled={busy}
              onClick={() => act('done')}
              size="sm"
              variant="ghost"
            >
              {t('promotion.step.done')}
            </Button>
          )}
          {step.kind === 'POST' && step.state !== 'REJECTED' && (
            <Button
              onClick={() => onOpenPosts(step.id)}
              size="sm"
              variant="ghost"
            >
              <ArrowUpRight aria-hidden="true" />
              {t('promotion.step.openPosts')}
            </Button>
          )}
        </div>
      )}
    </li>
  )
}
