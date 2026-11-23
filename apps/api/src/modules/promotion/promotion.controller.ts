import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  GetAiAllowanceSwagger,
  GetPromotionPlanSwagger,
  GetPromotionProfileSwagger,
  RequestPromotionPlanSwagger,
  SavePromotionProfileSwagger,
  UpdatePromotionStepSwagger,
} from './decorators/promotion.swagger'
import {
  type PromotionProfileInput,
  PromotionProfileSchema,
  type UpdatePromotionStepInput,
  UpdatePromotionStepSchema,
} from './dtos/promotion.dto'
import { PromotionPlansService } from './plans/promotion-plans.service'
import { PromotionProfileService } from './profile/promotion-profile.service'
import { AiQuotaService } from './usage/ai-quota.service'

/** The signed-in artist's AI promotion: profile, allowance and per-release plans. */
@ApiTags('Artist promotion')
@Controller({ path: 'artists/me', version: '1' })
export class PromotionController {
  constructor(
    private readonly profiles: PromotionProfileService,
    private readonly plans: PromotionPlansService,
    private readonly quota: AiQuotaService,
  ) {}

  @GetPromotionProfileSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('promotion-profile')
  profile(@Req() request: ArtistAuthRequest) {
    return this.profiles.get(request.artist.id)
  }

  @SavePromotionProfileSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Put('promotion-profile')
  saveProfile(
    @Req() request: ArtistAuthRequest,
    @Body(new ZodValidationPipe(PromotionProfileSchema)) input: PromotionProfileInput,
  ) {
    return this.profiles.save(request.artist.id, input)
  }

  @GetAiAllowanceSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('promotion/allowance')
  allowance(@Req() request: ArtistAuthRequest) {
    return this.quota.allowance(request.artist.id)
  }

  @RequestPromotionPlanSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('releases/:releaseId/promotion/plans')
  requestPlan(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
  ) {
    return this.plans.request(request.artist.id, releaseId)
  }

  @GetPromotionPlanSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('releases/:releaseId/promotion/plans/latest')
  plan(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
  ) {
    return this.plans.view(request.artist.id, releaseId)
  }

  @UpdatePromotionStepSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch('releases/:releaseId/promotion/steps/:stepId')
  updateStep(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
    @Param('stepId', new ParseUUIDPipe()) stepId: string,
    @Body(new ZodValidationPipe(UpdatePromotionStepSchema)) input: UpdatePromotionStepInput,
  ) {
    return this.plans.updateStep(request.artist.id, releaseId, stepId, input)
  }
}
