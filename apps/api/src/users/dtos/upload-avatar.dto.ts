import { ApiProperty } from '@nestjs/swagger'

export class UploadAvatarDto {
  @ApiProperty({ description: 'User avatar', type: 'string', format: 'binary' })
  avatar: string
}
