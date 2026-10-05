import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateReleaseDto } from '../dtos/create-release.dto'
import { ReleaseEntity } from '../entities/release.entity'

export function CreateReleaseSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create an artist-owned release draft',
      description:
        'Creates a preparation workspace in DRAFT status. Does not publish or distribute music.',
    }),
    ApiBody({ type: CreateReleaseDto }),
    ApiResponse({ status: HttpStatus.CREATED, type: ReleaseEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid draft fields' }),
  )
}
