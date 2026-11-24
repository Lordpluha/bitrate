import { Button, Input, Textarea, toast } from '@bitrate/ui-react'
import {
  AiMarker,
  type PromotionPost,
  reportPostAction,
  useUpdatePost,
} from '@entities/promotion'
import { useI18n } from '@shared/i18n'
import { Copy, Download } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import type { StepRef } from './stepRef'

interface PostMasterEditorProps {
  stepRef: StepRef
  post: PromotionPost
}

const hashtagsOf = (value: string) => value.split(/\s+/).filter(Boolean)
/** The text the artist takes away: the caption, then the hashtags. */
const exportText = (post: PromotionPost) =>
  [post.text, post.hashtags.join(' ')].filter(Boolean).join('\n\n')

/** The English master of one channel: edit, copy or download; Bitrate never posts it. */
export function PostMasterEditor({ stepRef, post }: PostMasterEditorProps) {
  const { t, tMessage } = useI18n()
  const id = useId()
  const update = useUpdatePost(stepRef)
  const [text, setText] = useState(post.text)
  const [hashtags, setHashtags] = useState(post.hashtags.join(' '))
  const dirty = text !== post.text || hashtags !== post.hashtags.join(' ')
  const save = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await update.mutateAsync({
        postId: post.id,
        input: { text, hashtags: hashtagsOf(hashtags) },
      })
      toast.success(t('promotion.posts.saved'))
    } catch {
      // The error stays on screen with the entries.
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportText(post))
      toast.success(t('promotion.posts.copied'))
      reportPostAction(stepRef, post.id, 'copied')
    } catch {
      toast.error(t('promotion.posts.copyFailed'))
    }
  }
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([exportText(post)], { type: 'text/plain' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `${post.channel.toLowerCase()}.txt`
    link.click()
    URL.revokeObjectURL(url)
    reportPostAction(stepRef, post.id, 'exported')
  }
  return (
    <form
      aria-busy={update.isPending}
      className="mt-4 grid gap-3"
      onSubmit={save}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{t('promotion.posts.master')}</h3>
        {post.aiGenerated && <AiMarker />}
      </div>
      <label className="grid gap-1 text-sm" htmlFor={`${id}-text`}>
        {t('promotion.posts.caption')}
        <Textarea
          id={`${id}-text`}
          maxLength={post.maxLength}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          value={text}
        />
      </label>
      <p className="text-xs text-text-secondary">
        {t('promotion.posts.length', {
          count: text.length,
          max: post.maxLength,
        })}
      </p>
      <label className="grid gap-1 text-sm" htmlFor={`${id}-tags`}>
        {t('promotion.posts.hashtags')}
        <Input
          aria-describedby={`${id}-tags-hint`}
          id={`${id}-tags`}
          onChange={(event) => setHashtags(event.target.value)}
          value={hashtags}
        />
      </label>
      <p className="text-xs text-text-secondary" id={`${id}-tags-hint`}>
        {t('promotion.posts.hashtagsHint')}
      </p>
      {update.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(update.error.message)}
        </p>
      )}
      <div className="artist-promotion-actions">
        <Button disabled={!dirty || update.isPending} size="sm" type="submit">
          {t('promotion.posts.save')}
        </Button>
        <Button
          disabled={dirty}
          onClick={copy}
          size="sm"
          type="button"
          variant="outline"
        >
          <Copy aria-hidden="true" />
          {t('promotion.posts.copy')}
        </Button>
        <Button
          disabled={dirty}
          onClick={download}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Download aria-hidden="true" />
          {t('promotion.posts.download')}
        </Button>
      </div>
    </form>
  )
}
