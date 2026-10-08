import { AlbumType } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Drafts need only a title; ownership and workflow status are server-controlled. */
export const CreateReleaseSchema = z.strictObject({
  title: z.string().trim().min(1).max(255),
  type: z.enum(AlbumType).optional().describe('Defaults to SINGLE when omitted'),
})

export class CreateReleaseDto extends createZodDto(CreateReleaseSchema) {}
