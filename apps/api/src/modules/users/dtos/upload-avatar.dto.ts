import { ApiProperty } from '@nestjs/swagger'

/** Represents the upload avatar dto. */
export class UploadAvatarDto {
  /** The avatar value. */
  @ApiProperty({ description: 'User avatar', type: 'string', format: 'binary' })
  avatar: string
}
