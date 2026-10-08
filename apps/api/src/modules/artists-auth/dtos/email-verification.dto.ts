import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const VerifyArtistEmailSchema = z.object({ token: z.string().min(1) })
export class VerifyArtistEmailDto extends createZodDto(VerifyArtistEmailSchema) {}

export const VerifyArtistEmailCodeSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  code: z.string().regex(/^\d{6}$/),
})
export class VerifyArtistEmailCodeDto extends createZodDto(VerifyArtistEmailCodeSchema) {}

export const ResendArtistEmailSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
})
export class ResendArtistEmailDto extends createZodDto(ResendArtistEmailSchema) {}
