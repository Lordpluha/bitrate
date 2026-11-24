import { Button, Textarea } from '@bitrate/ui-react'
import {
  type PromotionTranslation,
  translationStateLabels,
  useRequestTranslation,
  useUpdateTranslation,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useId, useState } from 'react'
import type { StepRef } from './stepRef'

interface TranslationEditorProps {
  stepRef: StepRef
  postId: string
  translation: PromotionTranslation
}

/**
 * One translation: the artist reviews, edits and rates it (spec D-20). An edit is kept when the
 * English changes; a STALE one is re-translated only on the artist's request.
 */
export function TranslationEditor({
  stepRef,
  postId,
  translation,
}: TranslationEditorProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const update = useUpdateTranslation(stepRef)
  const retranslate = useRequestTranslation(stepRef)
  const [text, setText] = useState(translation.text)
  const busy = translation.state === 'TRANSLATING'
  const error = update.error ?? retranslate.error
  const rate = (rating: 1 | -1) =>
    update.mutate({ translationId: translation.id, input: { rating } })
  return (
    <section aria-labelledby={`${id}-title`} className="artist-promotion-step">
      <div className="artist-promotion-step-head">
        <h4 className="artist-release-row-title" id={`${id}-title`}>
          {t(`promotion.language.${translation.language}`)}
        </h4>
        <span
          className="artist-release-chip"
          data-tone={translation.state === 'STALE' ? 'warning' : 'info'}
        >
          {t(translationStateLabels[translation.state])}
        </span>
      </div>
      {translation.state === 'MACHINE' && (
        <p className="artist-promotion-step-meta">
          {t('promotion.posts.machineNote')}
        </p>
      )}
      {!busy && translation.state !== 'FAILED' && (
        <Textarea
          aria-labelledby={`${id}-title`}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          value={text}
        />
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(error.message)}
        </p>
      )}
      <div className="artist-promotion-actions">
        {!busy && text !== translation.text && (
          <Button
            disabled={update.isPending}
            onClick={() =>
              update.mutate({ translationId: translation.id, input: { text } })
            }
            size="sm"
          >
            {t('promotion.posts.save')}
          </Button>
        )}
        {(translation.state === 'STALE' || translation.state === 'FAILED') && (
          <Button
            disabled={retranslate.isPending}
            onClick={() =>
              retranslate.mutate({ postId, language: translation.language })
            }
            size="sm"
            variant="outline"
          >
            <RefreshCw aria-hidden="true" />
            {t('promotion.posts.translateAgain')}
          </Button>
        )}
        {!busy && translation.state !== 'FAILED' && (
          <>
            <span className="artist-promotion-step-meta">
              {t('promotion.posts.rateQuestion')}
            </span>
            <Button
              aria-pressed={translation.rating === 1}
              disabled={update.isPending}
              onClick={() => rate(1)}
              size="sm"
              variant="ghost"
            >
              <ThumbsUp aria-hidden="true" />
              {t('promotion.posts.good')}
            </Button>
            <Button
              aria-pressed={translation.rating === -1}
              disabled={update.isPending}
              onClick={() => rate(-1)}
              size="sm"
              variant="ghost"
            >
              <ThumbsDown aria-hidden="true" />
              {t('promotion.posts.needsWork')}
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
