import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const taskStatuses = [
  'TODO',
  'IN_PROGRESS',
  'DONE',
] as const satisfies readonly ApiSchemas['ReleaseTaskStatus'][]

export type TaskStatus = (typeof taskStatuses)[number]

export const taskStatusLabels = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
} satisfies Record<TaskStatus, string>

/** The Tasks page filters; OPEN is everything not yet done. */
export const taskFilters = ['OPEN', ...taskStatuses] as const
export type TaskFilter = (typeof taskFilters)[number]

export const taskFilterLabels = {
  OPEN: 'Open',
  ...taskStatusLabels,
} satisfies Record<TaskFilter, string>

const instant = z.iso.datetime({ offset: true })

export const releaseTaskSchema = z.object({
  id: z.uuid(),
  releaseId: z.uuid(),
  title: z.string(),
  notes: z.string().nullable(),
  status: z.enum(taskStatuses),
  dueAt: instant.nullable(),
  completedAt: instant.nullable(),
  assignee: z.object({ id: z.uuid(), displayName: z.string() }).nullable(),
  createdAt: instant,
  updatedAt: instant,
})

export type ReleaseTask = z.infer<typeof releaseTaskSchema>

export const releaseTaskListSchema = z.object({
  data: z.array(releaseTaskSchema).max(200),
  total: z.number().int().nonnegative(),
})

export const artistTaskSchema = releaseTaskSchema.extend({
  release: z.object({
    id: z.uuid(),
    title: z.string(),
    status: z.enum(['DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED']),
  }),
})

export type ArtistTask = z.infer<typeof artistTaskSchema>

export const artistTaskPageSchema = z.object({
  data: z.array(artistTaskSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  counts: z.object({
    TODO: z.number().int().nonnegative(),
    IN_PROGRESS: z.number().int().nonnegative(),
    DONE: z.number().int().nonnegative(),
    overdue: z.number().int().nonnegative(),
  }),
})

export type ArtistTaskPage = z.infer<typeof artistTaskPageSchema>

/** Values the task form edits; dates are the `<input type="date">` value or empty. */
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter what needs to be done.')
    .max(200, 'Keep the title under 200 characters.'),
  notes: z.string().max(2000, 'Keep the notes under 2,000 characters.'),
  dueDate: z.union([z.literal(''), z.iso.date()]),
  assigneeContributorId: z.union([z.literal(''), z.uuid()]),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

/** A due date is the end of that UTC day, so a task is overdue only once the day has passed. */
export function dueDateToInstant(date: string): string | null {
  return date === '' ? null : `${date}T23:59:59.999Z`
}

export function instantToDueDate(instant: string | null): string {
  return instant ? instant.slice(0, 10) : ''
}

export function isOverdue(
  task: Pick<ReleaseTask, 'status' | 'dueAt'>,
  now = Date.now(),
): boolean {
  return (
    task.status !== 'DONE' &&
    task.dueAt !== null &&
    Date.parse(task.dueAt) < now
  )
}

const dueFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

export function formatDue(instant: string): string {
  return dueFormatter.format(new Date(instant))
}
