import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateAlbumDto } from '../dtos'
import { AlbumEntity } from '../entities'

/** Runs the create album swagger operation. */
export function CreateAlbumSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new album' }),
    ApiBody({ type: CreateAlbumDto, required: true }),
    ApiResponse({
      status: HttpStatus.OK,
      type: AlbumEntity,
    }),
  )
}
