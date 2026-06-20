import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
})

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string
}
