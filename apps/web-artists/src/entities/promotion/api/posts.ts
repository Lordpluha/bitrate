import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type StepPosts, stepPostsSchema } from '../model/promotion.schema'
import { PLAN_POLL_MS } from './plan'
import { promotionKeys } from './promotionKeys'
import { readPromotion } from './promotionRequest'

const STEP_POSTS =
  '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}/posts' as const

/** True while drafts or a translation are still being written. */
const arePostsBusy = (posts: StepPosts | undefined) =>
  posts?.status === 'GENERATING' ||
  Boolean(
    posts?.posts.some((post) =>
      post.translations.some((tr) => tr.state === 'TRANSLATING'),
    ),
  )

interface StepRef {
  artistId: string
  releaseId: string
  stepId: string
}

/** The drafts of a POST step and their translations. */
export function useStepPosts({ artistId, releaseId, stepId }: StepRef) {
  return useQuery({
    queryKey: promotionKeys.posts(artistId, stepId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(STEP_POSTS, {
        params: { path: { releaseId, stepId } },
        signal,
      })
      return readPromotion(result, stepPostsSchema, 'promotion.error.loadPosts')
    },
    refetchInterval: (query) =>
      arePostsBusy(query.state.data) ? PLAN_POLL_MS : false,
    staleTime: 0,
  })
}

function usePostsWrite<Request>(
  { artistId, stepId }: StepRef,
  write: (request: Request) => Promise<StepPosts>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    retry: false,
    onSuccess: async (posts) => {
      queryClient.setQueryData(promotionKeys.posts(artistId, stepId), posts)
      await queryClient.invalidateQueries({
        queryKey: promotionKeys.allowance(artistId),
      })
    },
  })
}

/** Writes the English masters, one per channel of the step. */
export function useRequestPosts(ref: StepRef) {
  const { releaseId, stepId } = ref
  return usePostsWrite(ref, async () => {
    const result = await clientFetchClient.POST(STEP_POSTS, {
      params: { path: { releaseId, stepId } },
      signal: writeSignal(),
    })
    return readPromotion(result, stepPostsSchema, 'promotion.error.writePosts')
  })
}

export interface PostEdit {
  postId: string
  input: ApiSchemas['UpdatePromotionPostDto']
}

/** Saves the English master; its translations become STALE unless the artist edited them. */
export function useUpdatePost(ref: StepRef) {
  const { releaseId, stepId } = ref
  return usePostsWrite(ref, async ({ postId, input }: PostEdit) => {
    const result = await clientFetchClient.PATCH(
      '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}/posts/{postId}',
      {
        params: { path: { releaseId, stepId, postId } },
        body: input,
        signal: writeSignal(),
      },
    )
    return readPromotion(result, stepPostsSchema, 'promotion.error.savePost')
  })
}

export interface TranslationRequest {
  postId: string
  language: ApiSchemas['RequestTranslationDto']['language']
}

export function useRequestTranslation(ref: StepRef) {
  const { releaseId, stepId } = ref
  return usePostsWrite(
    ref,
    async ({ postId, language }: TranslationRequest) => {
      const result = await clientFetchClient.POST(
        '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}/posts/{postId}/translations',
        {
          params: { path: { releaseId, stepId, postId } },
          body: { language },
          signal: writeSignal(),
        },
      )
      return readPromotion(result, stepPostsSchema, 'promotion.error.translate')
    },
  )
}

export interface TranslationEdit {
  translationId: string
  input: ApiSchemas['UpdatePromotionTranslationDto']
}

/** Edits a translation or rates it; an edit is kept when the English changes. */
export function useUpdateTranslation(ref: StepRef) {
  const { releaseId, stepId } = ref
  return usePostsWrite(
    ref,
    async ({ translationId, input }: TranslationEdit) => {
      const result = await clientFetchClient.PATCH(
        '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}/translations/{translationId}',
        {
          params: { path: { releaseId, stepId, translationId } },
          body: input,
          signal: writeSignal(),
        },
      )
      return readPromotion(
        result,
        stepPostsSchema,
        'promotion.error.saveTranslation',
      )
    },
  )
}

/** Reports a copy or a download; a failed report never blocks the artist. */
export function reportPostAction(
  { releaseId, stepId }: Omit<StepRef, 'artistId'>,
  postId: string,
  action: ApiSchemas['PostActionDto']['action'],
) {
  void clientFetchClient
    .POST(
      '/api/v1/artists/me/releases/{releaseId}/promotion/steps/{stepId}/posts/{postId}/actions',
      {
        params: { path: { releaseId, stepId, postId } },
        body: { action },
      },
    )
    .catch(() => undefined)
}
