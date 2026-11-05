import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
import { Body, Controller, Get, Header, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common'
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
  read(@CurrentArtist() artist: ArtistEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.delivery.delivery(artist.id, id)
  }

  @UpdateDeliveryPlanSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put(':id/delivery-plan')
  updatePlan(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateDeliveryPlanSchema)) input: UpdateDeliveryPlanDto,
  ) {
    return this.delivery.updatePlan(artist.id, id, input)
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
    @CurrentArtist() artist: ArtistEntity,
    @Query(new ZodValidationPipe(ListDistributionSchema)) query: ListDistributionDto,
  ) {
    return this.delivery.listForArtist(artist.id, query)
  }
}
