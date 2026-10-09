import type { ApiSchemas } from '@bitrate/contracts'
import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { uploadForm } from '@shared/api/uploadForm'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import {
  type ArtistProfile,
  artistProfileSchema,
} from '../model/profile.schema'

const WRITE_TIMEOUT_MS = 30_000
const STALE =
  'Your profile changed since this page loaded. Your entries are kept; reload the page to see the latest version.'

const accountKeys = {
  profile: (artistId: string) =>
    [...artistMusicKeys.artist(artistId), 'profile'] as const,
}

export function useArtistProfile(artistId: string) {
  return useQuery({
    queryKey: accountKeys.profile(artistId),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET('/api/v1/artist-profile', {
        signal,
      })
      const parsed = artistProfileSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error('Could not load your profile. Please try again.')
      return parsed.data
    },
    staleTime: 0,
  })
}

/** Confirms a profile write by a newer version; never reports an unverified save. */
function confirmProfile(
  status: number,
  ok: boolean,
  data: unknown,
  expectedUpdatedAt: string,
  messages: { invalid: string; unconfirmed: string },
) {
  if (status === 409) {
    const parsed = z.object({ code: z.string() }).safeParse(data)
    throw new Error(
      parsed.success &&
        parsed.data.code === 'errors.artist_profile.username_taken'
        ? 'This handle is already taken. Choose another one.'
        : STALE,
    )
  }
  if (status === 400) throw new Error(messages.invalid)
  const parsed = artistProfileSchema.safeParse(data)
  if (
    !ok ||
    !parsed.success ||
    Date.parse(parsed.data.updatedAt) <= Date.parse(expectedUpdatedAt)
  )
    throw new Error(messages.unconfirmed)
  return parsed.data
}

function useProfileWrite<Request>(
  artistId: string,
  write: (request: Request) => Promise<ArtistProfile>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    retry: false,
    onSuccess: (profile) =>
      queryClient.setQueryData(accountKeys.profile(artistId), profile),
  })
}

export interface ProfileUpdateRequest {
  input: ApiSchemas['UpdateArtistProfileDto']
}

export function useUpdateProfile(artistId: string) {
  return useProfileWrite(artistId, async ({ input }: ProfileUpdateRequest) => {
    const unconfirmed =
      'Could not confirm your profile was saved. Reload the page before trying again.'
    const send = () =>
      clientFetchClient.PATCH('/api/v1/artist-profile', {
        body: input,
        signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
      })
    let result: Awaited<ReturnType<typeof send>>
    try {
      result = await send()
    } catch {
      throw new Error(unconfirmed)
    }
    return confirmProfile(
      result.response.status,
      result.response.ok,
      result.response.ok ? result.data : result.error,
      input.expectedUpdatedAt,
      {
        invalid: 'Check the highlighted fields, then try again.',
        unconfirmed,
      },
    )
  })
}

export type ProfileImageKind = 'avatar' | 'background'

export interface ProfileImageRequest {
  kind: ProfileImageKind
  /** A new image to upload, or null to remove the current one. */
  file: File | null
  expectedUpdatedAt: string
  onProgress?: (fraction: number) => void
}

export function useProfileImage(artistId: string) {
  return useProfileWrite(
    artistId,
    async ({
      kind,
      file,
      expectedUpdatedAt,
      onProgress,
    }: ProfileImageRequest) => {
      const messages = {
        invalid: 'Choose a JPEG, PNG or WebP image up to 10 MB.',
        unconfirmed:
          'Could not confirm the image was saved. Reload the page before trying again.',
      }
      if (file === null) {
        const send = () =>
          clientFetchClient.DELETE('/api/v1/artist-profile/{kind}', {
            params: { path: { kind } },
            body: { expectedUpdatedAt },
            signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
          })
        let result: Awaited<ReturnType<typeof send>>
        try {
          result = await send()
        } catch {
          throw new Error(messages.unconfirmed)
        }
        return confirmProfile(
          result.response.status,
          result.response.ok,
          result.response.ok ? result.data : result.error,
          expectedUpdatedAt,
          messages,
        )
      }
      const form = new FormData()
      form.append('expectedUpdatedAt', expectedUpdatedAt)
      form.append('image', file)
      let result: Awaited<ReturnType<typeof uploadForm>>
      try {
        result = await uploadForm({
          method: 'PUT',
          path: `/api/v1/artist-profile/${kind}`,
          form,
          onProgress,
          signal: AbortSignal.timeout(5 * 60_000),
        })
      } catch {
        throw new Error(messages.unconfirmed)
      }
      if (result.status === 413) throw new Error(messages.invalid)
      return confirmProfile(
        result.status,
        result.ok,
        result.data,
        expectedUpdatedAt,
        messages,
      )
    },
  )
}
