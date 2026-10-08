import { createZodDto } from 'nestjs-zod'
import { AddReleaseContributorSchema } from './add-release-contributor.dto'

export const UpdateReleaseContributorSchema = AddReleaseContributorSchema
export class UpdateReleaseContributorDto extends createZodDto(UpdateReleaseContributorSchema) {}
