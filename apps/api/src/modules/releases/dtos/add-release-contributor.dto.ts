import { ReleaseCreditRole } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const AddReleaseContributorSchema = z.strictObject({
  displayName: z.string().trim().min(1).max(255),
  roles: z
    .array(z.enum(ReleaseCreditRole))
    .min(1)
    .max(5)
    .refine((roles) => new Set(roles).size === roles.length, 'Choose each role once'),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export class AddReleaseContributorDto extends createZodDto(AddReleaseContributorSchema) {}
