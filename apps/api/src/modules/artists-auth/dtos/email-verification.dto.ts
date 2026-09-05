import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const VerifyArtistEmailSchema = z.object({ token: z.string().min(1) })
export class VerifyArtistEmailDto extends createZodDto(VerifyArtistEmailSchema) {}

export const ResendArtistEmailSchema = z.object({ email: z.email() })
export class ResendArtistEmailDto extends createZodDto(ResendArtistEmailSchema) {}
