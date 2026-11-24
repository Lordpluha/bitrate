import { Button } from '@bitrate/ui-react'
import {
  channelNames,
  type PromotionStep,
  useRequestPosts,
  useStepPosts,
  useUpdateStep,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { ArrowLeft, Check, PenLine, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { PostMasterEditor } from './PostMasterEditor'
import { PostTranslations } from './PostTranslations'

interface StepPostsPanelProps {
  artistId: string
  releaseId: string
  step: PromotionStep
  canGenerate: boolean
  onBack: () => void
}

/** The drafts of one POST step: a tab per channel, the English master and its translations. */
export function StepPostsPanel({
  artistId,
  releaseId,
  step,
  canGenerate,
  onBack,
}: StepPostsPanelProps) {
  const { t, tMessage } = useI18n()
  const stepRef = { artistId, releaseId, stepId: step.id }
  const query = useStepPosts(stepRef)
  const request = useRequestPosts(stepRef)
  const finish = useUpdateStep(artistId, releaseId)
  const [channel, setChannel] = useState(0)
  const posts = query.data?.posts ?? []
  const post = posts[Math.min(channel, posts.length - 1)]
  const status = query.data?.status
  const open = step.state === 'APPROVED' || step.state === 'EDITED'
  const error = query.error ?? request.error ?? finish.error
  return (
    <section
      aria-labelledby="promotion-posts-heading"
      className="artist-release-workspace-panel"
    >
      <Button onClick={onBack} size="sm" variant="ghost">
        <ArrowLeft aria-hidden="true" />
        {t('promotion.posts.back')}
      </Button>
      <h2 className="mt-3" id="promotion-posts-heading">
        <PanelIcon icon={PenLine} />
        {step.title}
      </h2>
      {query.isPending && <p role="status">{t('promotion.page.loading')}</p>}
      {status === 'GENERATING' && (
        <p role="status">{t('promotion.posts.writing')}</p>
      )}
      {status === 'FAILED' && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(query.data?.failure ?? 'promotion.posts.failed')}
        </p>
      )}
      {(status === null || status === 'FAILED') && canGenerate && (
        <div className="mt-4 grid gap-2">
          <p className="artist-promotion-step-meta">
            {t('promotion.posts.writeHint')}
          </p>
          <div>
            <Button
              disabled={request.isPending}
              onClick={() => request.mutate()}
              size="sm"
            >
              <Sparkles aria-hidden="true" />
              {t('promotion.posts.write')}
            </Button>
          </div>
        </div>
      )}
      {post && status === 'READY' && (
        <>
          <div
            aria-label={t('promotion.posts.title')}
            className="artist-promotion-tabs"
            role="tablist"
          >
            {posts.map((item, index) => (
              <Button
                aria-selected={item.id === post.id}
                key={item.id}
                onClick={() => setChannel(index)}
                role="tab"
                size="sm"
                variant={item.id === post.id ? 'secondary' : 'ghost'}
              >
                {channelNames[item.channel]}
              </Button>
            ))}
          </div>
          <PostMasterEditor
            key={`${post.id}:${post.revision}`}
            post={post}
            stepRef={stepRef}
          />
          <PostTranslations
            canGenerate={canGenerate}
            post={post}
            stepRef={stepRef}
          />
          <div className="mt-6 grid gap-2">
            {open && (
              <div>
                <Button
                  disabled={finish.isPending}
                  onClick={() =>
                    finish.mutate({
                      stepId: step.id,
                      input: { action: 'done' },
                    })
                  }
                  size="sm"
                >
                  <Check aria-hidden="true" />
                  {t('promotion.posts.publish')}
                </Button>
              </div>
            )}
            <p className="artist-promotion-step-meta">
              {t('promotion.posts.publishNote')}
            </p>
          </div>
        </>
      )}
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {tMessage(error.message)}
        </p>
      )}
    </section>
  )
}
