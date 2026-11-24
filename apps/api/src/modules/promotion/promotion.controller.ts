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
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { PromotionAccessService, PromotionAuth } from './access'
import { PromotionCalendarService } from './calendar'
import {
  GetAiAllowanceSwagger,
  GetPromotionCalendarSwagger,
  GetPromotionPlanSwagger,
  GetPromotionProfileSwagger,
  RegenerateStepSwagger,
  RequestPromotionPlanSwagger,
  SavePromotionProfileSwagger,
  UpdatePromotionStepSwagger,
} from './decorators'
import {
  type CalendarQuery,
  CalendarQuerySchema,
  type PromotionProfileInput,
  PromotionProfileSchema,
  type RegenerateStepInput,
  RegenerateStepSchema,
  type UpdatePromotionStepInput,
  UpdatePromotionStepSchema,
} from './dtos'
import {
  PlanViewService,
  RequestPlanService,
  RequestStepRegenerationService,
  UpdateStepService,
} from './plans'
import { PromotionProfileService } from './profile/promotion-profile.service'
import { AiQuotaService } from './usage'

/** The signed-in artist's AI promotion: profile, allowance and per-release plans. */
@ApiTags('Artist promotion')
@Controller({ path: 'artists/me', version: '1' })
export class PromotionController {
  constructor(
    private readonly profiles: PromotionProfileService,
    private readonly requests: RequestPlanService,
    private readonly views: PlanViewService,
    private readonly steps: UpdateStepService,
    private readonly quota: AiQuotaService,
    private readonly regenerations: RequestStepRegenerationService,
    private readonly calendars: PromotionCalendarService,
    private readonly access: PromotionAccessService,
  ) {}

  @GetPromotionProfileSwagger()
  @PromotionAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('promotion-profile')
  profile(@Req() request: ArtistAuthRequest) {
    return this.profiles.get(request.artist.id)
  }

  @SavePromotionProfileSwagger()
  @PromotionAuth()
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
  async allowance(@Req() request: ArtistAuthRequest) {
    const allowance = await this.quota.allowance(request.artist.id)
    return { ...allowance, enabled: this.access.isEnabled(request.artist) }
  }

  @GetPromotionCalendarSwagger()
  @PromotionAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('promotion/calendar')
  calendar(
    @Req() request: ArtistAuthRequest,
    @Query(new ZodValidationPipe(CalendarQuerySchema)) query: CalendarQuery,
  ) {
    return this.calendars.calendar(request.artist.id, query.from, query.to)
  }

  @RequestPromotionPlanSwagger()
  @PromotionAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('releases/:releaseId/promotion/plans')
  requestPlan(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
  ) {
    return this.requests.request(request.artist.id, releaseId)
  }

  @GetPromotionPlanSwagger()
  @PromotionAuth()
  @Header('Cache-Control', 'private, no-store')
  @Get('releases/:releaseId/promotion/plans/latest')
  plan(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
  ) {
    return this.views.view(request.artist.id, releaseId)
  }

  @UpdatePromotionStepSwagger()
  @PromotionAuth()
  @Header('Cache-Control', 'private, no-store')
  @Patch('releases/:releaseId/promotion/steps/:stepId')
  updateStep(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
    @Param('stepId', new ParseUUIDPipe()) stepId: string,
    @Body(new ZodValidationPipe(UpdatePromotionStepSchema)) input: UpdatePromotionStepInput,
  ) {
    return this.steps.update(request.artist.id, releaseId, stepId, input)
  }

  @RegenerateStepSwagger()
  @PromotionAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('releases/:releaseId/promotion/steps/:stepId/regenerate')
  regenerateStep(
    @Req() request: ArtistAuthRequest,
    @Param('releaseId', new ParseUUIDPipe()) releaseId: string,
    @Param('stepId', new ParseUUIDPipe()) stepId: string,
    @Body(new ZodValidationPipe(RegenerateStepSchema)) input: RegenerateStepInput,
  ) {
    return this.regenerations.request(request.artist.id, releaseId, stepId, input.hint)
  }
}
