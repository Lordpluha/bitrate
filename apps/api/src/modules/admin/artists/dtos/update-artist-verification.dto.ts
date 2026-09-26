import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const UpdateArtistVerificationSchema = z.object({
  verified: z.boolean(),
})

export class UpdateArtistVerificationDto extends createZodDto(UpdateArtistVerificationSchema) {}
