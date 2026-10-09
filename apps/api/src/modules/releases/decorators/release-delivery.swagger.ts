import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { UpdateDeliveryPlanDto } from '../dtos/release-delivery.dto'
import {
  DeliveryPlanUpdatedEntity,
  DistributionPageEntity,
  ReleaseDeliveryEntity,
} from '../entities/release-delivery.entity'

export function ReleaseDeliverySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Read the delivery plan and store states of an owned release',
      description:
        'Stores read NOT_CONNECTED while no distribution partner is connected; nothing is implied as sent.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: ReleaseDeliveryEntity }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
  )
}

export function UpdateDeliveryPlanSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Replace the delivery plan of an owned draft',
      description:
        'Sets the planned stores and territories. Saving a plan sends nothing; delivery starts only through a connected partner.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ type: UpdateDeliveryPlanDto }),
    ApiResponse({ status: HttpStatus.OK, type: DeliveryPlanUpdatedEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid stores or country codes' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Release unavailable to this artist',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Release changed since it was read or is no longer a draft',
    }),
  )
}

export function ListDistributionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "List the delivery plan and store states of the artist's releases",
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: HttpStatus.OK, type: DistributionPageEntity }),
  )
}
