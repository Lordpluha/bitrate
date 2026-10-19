import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { z } from 'zod'
import {
  artistTaskPageSchema,
  releaseTaskListSchema,
  releaseTaskSchema,
  type TaskFilter,
} from '../model/task.schema'

const WRITE_TIMEOUT_MS = 30_000
const signal = () => AbortSignal.timeout(WRITE_TIMEOUT_MS)

/** Shown for a task that changed or disappeared since it was read; the form keeps its input. */
const STALE =
  'This task changed or was removed since you opened it. Your entries are kept; close and reopen it to see the latest version.'

interface WriteResult {
  response: Response
  data?: unknown
}

async function guardedTaskWrite<T>(
  send: () => Promise<WriteResult>,
  confirm: (data: unknown) => T | undefined,
  messages: { invalid: string; unconfirmed: string },
): Promise<T> {
  let result: WriteResult
  try {
    result = await send()
  } catch {
    throw new Error(messages.unconfirmed)
  }
  const { status } = result.response
  if (status === 409 || status === 404) throw new Error(STALE)
  if (status === 400) throw new Error(messages.invalid)
  const confirmed = result.response.ok ? confirm(result.data) : undefined
  if (confirmed === undefined) throw new Error(messages.unconfirmed)
  return confirmed
}

export async function getReleaseTasks(releaseId: string, signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/releases/{id}/tasks', {
    params: { path: { id: releaseId } },
    signal,
  })
  if (result.response.status === 404)
    throw new Error('This release is no longer available.')
  const parsed = releaseTaskListSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success)
    throw new Error('Could not load the tasks. Please try again.')
  return parsed.data
}

export async function getArtistTasks(
  status: TaskFilter,
  page: number,
  signal: AbortSignal,
) {
  const result = await clientFetchClient.GET('/api/v1/release-tasks', {
    params: { query: { status, page, limit: 20 } },
    signal,
  })
  const parsed = artistTaskPageSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success || parsed.data.page !== page)
    throw new Error('Could not load your tasks. Please try again.')
  return parsed.data
}

export interface CreateTaskRequest {
  releaseId: string
  input: ApiSchemas['CreateReleaseTaskDto']
}

export function createTask({ releaseId, input }: CreateTaskRequest) {
  return guardedTaskWrite(
    () =>
      clientFetchClient.POST('/api/v1/releases/{id}/tasks', {
        params: { path: { id: releaseId } },
        body: input,
        signal: signal(),
      }),
    (data) => {
      const parsed = releaseTaskSchema.safeParse(data)
      return parsed.success &&
        parsed.data.releaseId === releaseId &&
        parsed.data.title === input.title.trim()
        ? parsed.data
        : undefined
    },
    {
      invalid: 'Check the task details and the assignee, then try again.',
      unconfirmed:
        'Could not confirm the task was saved. Close this form and check the task list before trying again.',
    },
  )
}

export interface UpdateTaskRequest {
  releaseId: string
  taskId: string
  input: ApiSchemas['UpdateReleaseTaskDto']
}

export function updateTask({ releaseId, taskId, input }: UpdateTaskRequest) {
  return guardedTaskWrite(
    () =>
      clientFetchClient.PATCH('/api/v1/releases/{id}/tasks/{taskId}', {
        params: { path: { id: releaseId, taskId } },
        body: input,
        signal: signal(),
      }),
    (data) => {
      const parsed = releaseTaskSchema.safeParse(data)
      if (
        !parsed.success ||
        parsed.data.id !== taskId ||
        Date.parse(parsed.data.updatedAt) <=
          Date.parse(input.expectedUpdatedAt) ||
        (input.status !== undefined && parsed.data.status !== input.status)
      )
        return undefined
      return parsed.data
    },
    {
      invalid: 'Check the task details and the assignee, then try again.',
      unconfirmed:
        'Could not confirm the change was saved. Check the task list before trying again.',
    },
  )
}

export interface DeleteTaskRequest {
  releaseId: string
  taskId: string
  expectedUpdatedAt: string
}

const deletedSchema = z.object({ id: z.uuid() })

export function deleteTask({
  releaseId,
  taskId,
  expectedUpdatedAt,
}: DeleteTaskRequest) {
  return guardedTaskWrite(
    () =>
      clientFetchClient.DELETE('/api/v1/releases/{id}/tasks/{taskId}', {
        params: { path: { id: releaseId, taskId } },
        body: { expectedUpdatedAt },
        signal: signal(),
      }),
    (data) => {
      const parsed = deletedSchema.safeParse(data)
      return parsed.success && parsed.data.id === taskId
        ? parsed.data
        : undefined
    },
    {
      invalid: 'Could not delete this task. Please try again.',
      unconfirmed:
        'Could not confirm the task was deleted. Check the task list before trying again.',
    },
  )
}
