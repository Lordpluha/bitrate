import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const VerifyEmailSchema = z.object({
  token: z.string().min(1),
})

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}

export const ResendEmailVerificationSchema = z.object({
  email: z.email(),
})

export class ResendEmailVerificationDto extends createZodDto(ResendEmailVerificationSchema) {}
