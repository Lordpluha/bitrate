import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdatePromotionTranslationDto } from '../dtos'
import { StepPostsEntity } from '../entities'

export function UpdateTranslationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Edit or rate a translation',
      description: 'An edit makes the translation EDITED against the current English master.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiParam({ name: 'translationId', format: 'uuid' }),
    ApiBody({ type: UpdatePromotionTranslationDto }),
    ApiResponse({ status: HttpStatus.OK, type: StepPostsEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Translation not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Still translating' }),
  )
}
