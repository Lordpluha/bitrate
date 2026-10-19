import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { TaskFilter } from '../model/task.schema'
import {
  createTask,
  deleteTask,
  getArtistTasks,
  getReleaseTasks,
  updateTask,
} from './tasks'

/** Task caches live under the artist's music scope, so logout clears them with the rest. */
const taskKeys = {
  all: (artistId: string | undefined) =>
    [...artistMusicKeys.artist(artistId), 'tasks'] as const,
  release: (artistId: string, releaseId: string) =>
    [...taskKeys.all(artistId), 'release', releaseId] as const,
  artist: (artistId: string | undefined, status: TaskFilter, page: number) =>
    [...taskKeys.all(artistId), 'list', status, page] as const,
}

export function useReleaseTasks(artistId: string, releaseId: string) {
  return useQuery({
    queryKey: taskKeys.release(artistId, releaseId),
    queryFn: ({ signal }) => getReleaseTasks(releaseId, signal),
    retry: false,
    staleTime: 0,
  })
}

export function useArtistTasks(
  artistId: string | undefined,
  status: TaskFilter,
  page: number,
) {
  return useQuery({
    queryKey: taskKeys.artist(artistId, status, page),
    queryFn: ({ signal }) => getArtistTasks(status, page, signal),
    enabled: Boolean(artistId),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}

/** Every confirmed task write refreshes both the release panel and the Tasks page. */
function useTaskWrite<Request, Result>(
  artistId: string,
  write: (request: Request) => Promise<Result>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: write,
    retry: false,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: taskKeys.all(artistId) }),
  })
}

export const useCreateTask = (artistId: string) =>
  useTaskWrite(artistId, createTask)
export const useUpdateTask = (artistId: string) =>
  useTaskWrite(artistId, updateTask)
export const useDeleteTask = (artistId: string) =>
  useTaskWrite(artistId, deleteTask)
