import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Неверный формат email' }),
  password: z
    .string()
    .min(6, { message: 'Пароль должен быть не короче 6 символов' })
    .max(32, { message: 'Пароль не должен быть длиннее 32 символов' })
})

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string;
}