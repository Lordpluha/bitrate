import { paginationQuerySchema } from '@common/pagination'
import { ReleaseTaskStatus } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RELEASE_VALIDATION } from '../errors'

const title = z.string().trim().min(1).max(200).describe('What needs to be done')
const notes = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .describe('Details or links; empty clears them')
const dueAt = z.iso
  .datetime({ offset: true, precision: 3 })
  .nullable()
  .describe('Deadline instant, ISO 8601 with milliseconds and timezone; null clears it')
const assigneeContributorId = z
  .uuid()
  .nullable()
  .describe('A participant credited on this release; null leaves the task unassigned')

export const CreateReleaseTaskSchema = z.strictObject({
  title,
  notes: notes.optional(),
  dueAt: dueAt.optional(),
  assigneeContributorId: assigneeContributorId.optional(),
})

export const UpdateReleaseTaskSchema = z
  .strictObject({
    title: title.optional(),
    notes: notes.optional(),
    dueAt: dueAt.optional(),
    assigneeContributorId: assigneeContributorId.optional(),
    status: z.enum(ReleaseTaskStatus).optional(),
    expectedUpdatedAt: z.iso
      .datetime({ offset: true })
      .describe('Task version read before editing'),
  })
  .refine(
    (input) =>
      input.title !== undefined ||
      input.notes !== undefined ||
      input.dueAt !== undefined ||
      input.assigneeContributorId !== undefined ||
      input.status !== undefined,
    { message: RELEASE_VALIDATION.UPDATE_EMPTY },
  )

export const DeleteReleaseTaskSchema = z.strictObject({
  expectedUpdatedAt: z.iso.datetime({ offset: true }).describe('Task version read before deleting'),
})

/** `OPEN` lists everything not yet done, which is what the Tasks page shows by default. */
export const ListArtistTasksSchema = paginationQuerySchema
  .extend({
    status: z.enum([...Object.values(ReleaseTaskStatus), 'OPEN'] as const).optional(),
  })
  .strict()

export class CreateReleaseTaskDto extends createZodDto(CreateReleaseTaskSchema) {}
export class UpdateReleaseTaskDto extends createZodDto(UpdateReleaseTaskSchema) {}
export class DeleteReleaseTaskDto extends createZodDto(DeleteReleaseTaskSchema) {}
export class ListArtistTasksDto extends createZodDto(ListArtistTasksSchema) {}
