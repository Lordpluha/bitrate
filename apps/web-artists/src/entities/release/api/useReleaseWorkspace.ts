import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { useQuery } from '@tanstack/react-query'
import { releaseWorkspaceSchema } from '../model/workspace.schema'

export function useReleaseWorkspace(artistId: string, id: string) {
  return useQuery({
    queryKey: [...artistMusicKeys.artist(artistId), 'workspace', id],
    queryFn: ({ signal }) => getReleaseWorkspace(id, signal),
    retry: false,
    gcTime: 0,
    staleTime: 0,
  })
}

async function getReleaseWorkspace(id: string, signal: AbortSignal) {
  const result = await clientFetchClient.GET(
    '/api/v1/releases/{id}/workspace',
    {
      params: { path: { id } },
      signal,
    },
  )
  if (result.response.status === 404)
    throw new Error('This release is no longer available.')
  const parsed = releaseWorkspaceSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success || parsed.data.id !== id)
    throw new Error('Could not load this release workspace. Please try again.')
  return parsed.data
}
