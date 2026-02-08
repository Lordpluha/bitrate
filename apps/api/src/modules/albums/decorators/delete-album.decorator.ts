import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function DeleteAlbumSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an album by ID',
      description: 'Deletes an album by its ID. Requires authentication.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
    }),
  )
}
