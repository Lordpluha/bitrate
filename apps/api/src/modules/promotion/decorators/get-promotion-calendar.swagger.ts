import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { PromotionCalendarEntryEntity } from '../entities'

export function GetPromotionCalendarSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upcoming promotion steps across all releases',
      description:
        'Steps of the latest plan of every dated release, soonest first; rejected steps are ' +
        'left out. The window is at most 120 days.',
    }),
    ApiQuery({
      name: 'from',
      required: false,
      type: String,
      format: 'date-time',
      description: 'Inclusive; defaults to 7 days ago',
    }),
    ApiQuery({
      name: 'to',
      required: false,
      type: String,
      format: 'date-time',
      description: 'Exclusive; defaults to 63 days after `from`',
    }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionCalendarEntryEntity, isArray: true }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Empty or too long window' }),
  )
}
