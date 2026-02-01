import { UpdateUserDto } from '@modules/users'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function PutUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user by id' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User profile updated successfully',
      schema: {
        $ref: '#/components/schemas/SafeUserEntity',
      },
    }),
    ApiBody({
      description: 'User data to update',
      type: UpdateUserDto,
    }),
  )
}
