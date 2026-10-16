import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  ListDistributionSwagger,
  ReleaseDeliverySwagger,
  UpdateDeliveryPlanSwagger,
} from './decorators'
import {
  type ListDistributionDto,
  ListDistributionSchema,
  type UpdateDeliveryPlanDto,
  UpdateDeliveryPlanSchema,
} from './dtos/release-delivery.dto'
import { ReleaseDeliveryService } from './release-delivery.service'

@ApiTags('Releases')
@Controller({ path: 'releases', version: '1' })
export class ReleaseDeliveryController {
  constructor(private readonly delivery: ReleaseDeliveryService) {}

  @ReleaseDeliverySwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get(':id/delivery')
  read(@Req() request: ArtistAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.delivery.delivery(request.artist.id, id)
  }

  @UpdateDeliveryPlanSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put(':id/delivery-plan')
  updatePlan(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateDeliveryPlanSchema)) input: UpdateDeliveryPlanDto,
  ) {
    return this.delivery.updatePlan(request.artist.id, id, input)
  }
}

/** The artist-wide list behind the dashboard's Distribution page. */
@ApiTags('Releases')
@Controller({ path: 'distribution', version: '1' })
export class DistributionController {
  constructor(private readonly delivery: ReleaseDeliveryService) {}

  @ListDistributionSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get()
  list(
    @Req() request: ArtistAuthRequest,
    @Query(new ZodValidationPipe(ListDistributionSchema)) query: ListDistributionDto,
  ) {
    return this.delivery.listForArtist(request.artist.id, query)
  }
}
