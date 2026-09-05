import { UploadAvatarDto } from '@modules/users'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the upload avatar swagger operation. */
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
      schema: {
        $ref: '#/components/schemas/SafeUserEntity',
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Invalid file type or size',
    }),
  )
}
