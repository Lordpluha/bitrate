import { Button } from '@bitrate/ui-react'
import {
  type PromotionPost,
  translationLanguages,
  useRequestTranslation,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { Languages } from 'lucide-react'
import type { StepRef } from './stepRef'
import { TranslationEditor } from './TranslationEditor'

interface PostTranslationsProps {
  stepRef: StepRef
  post: PromotionPost
  /** False once the monthly allowance is used. */
  canGenerate: boolean
}

/** Ukrainian and Polish versions of the master, each labelled as a machine translation. */
export function PostTranslations({
  stepRef,
  post,
  canGenerate,
}: PostTranslationsProps) {
  const { t, tMessage } = useI18n()
  const request = useRequestTranslation(stepRef)
  const missing = translationLanguages.filter(
    (language) => !post.translations.some((tr) => tr.language === language),
  )
  return (
    <div className="mt-6 grid gap-3">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <Languages aria-hidden="true" className="size-4" />
        {t('promotion.posts.translations')}
      </h3>
      <p className="artist-promotion-step-meta">
        {t('promotion.posts.translationsNote')}
      </p>
      {post.translations.map((translation) => (
        <TranslationEditor
          key={`${translation.id}:${translation.state}:${translation.text}`}
          postId={post.id}
          stepRef={stepRef}
          translation={translation}
        />
      ))}
      {canGenerate && missing.length > 0 && (
        <div className="artist-promotion-actions">
          {missing.map((language) => (
            <Button
              disabled={request.isPending}
              key={language}
              onClick={() => request.mutate({ postId: post.id, language })}
              size="sm"
              variant="outline"
            >
              {t('promotion.posts.translateTo', {
                language: t(`promotion.language.${language}`),
              })}
            </Button>
          ))}
        </div>
      )}
      {request.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(request.error.message)}
        </p>
      )}
    </div>
  )
}
