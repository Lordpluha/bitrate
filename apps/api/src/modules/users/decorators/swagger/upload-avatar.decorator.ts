import { UploadAvatarDto } from '@modules/users'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function UploadAvatarSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload avatar for user' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Avatar file to upload',
      type: UploadAvatarDto,
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avatar uploaded successfully',
      example: {
        id: '1',
        username: 'user1',
        avatar: 'https://example.com/uploads/avatars/avatar.jpg',
        backgroundImage: '',
        bio: 'Some bio',
        createdAt: new Date(),
        email: 'example@gmail.com',
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Invalid file type or size',
    }),
  )
}
