import { UpdateUserDto } from '@modules/users'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SafeUserEntity } from '../../entities'

/** Runs the put user swagger operation. */
export function PutUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user by id' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User profile updated successfully',
      type: SafeUserEntity,
    }),
    ApiBody({
      description: 'User data to update',
      type: UpdateUserDto,
    }),
  )
}
