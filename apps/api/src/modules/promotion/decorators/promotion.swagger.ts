import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PromotionProfileDto, UpdatePromotionStepDto } from '../dtos/promotion.dto'
import {
  AiAllowanceEntity,
  PromotionPlanEntity,
  PromotionProfileEntity,
} from '../entities/promotion.entity'

const ReleaseParam = ApiParam({ name: 'releaseId', format: 'uuid' })

export function GetPromotionProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read the artist's promotion profile" }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionProfileEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No profile yet' }),
  )
}

export function SavePromotionProfileSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Replace the artist's promotion profile",
      description:
        'Goal, channels, weekly time, audience and voice that every plan generation reads. Audience and example posts may not contain links, emails, phone numbers or @handles.',
    }),
    ApiBody({ type: PromotionProfileDto }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionProfileEntity }),
  )
}

export function GetAiAllowanceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read the artist's AI allowance for this month" }),
    ApiResponse({ status: HttpStatus.OK, type: AiAllowanceEntity }),
  )
}

export function RequestPromotionPlanSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate a new promotion plan version for a release',
      description:
        'Starts generation in the background and returns the new GENERATING version. Steps the artist approved, edited or finished are kept; suggested ones are replaced.',
    }),
    ReleaseParam,
    ApiResponse({ status: HttpStatus.ACCEPTED, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'No release date, no profile, or a version is already generating',
    }),
    ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Monthly AI allowance used' }),
  )
}

export function GetPromotionPlanSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Read a release's latest promotion plan",
      description: 'Every step is dated from the release date as it is now.',
    }),
    ReleaseParam,
    ApiResponse({ status: HttpStatus.OK, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or plan not found' }),
  )
}

export function UpdatePromotionStepSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve, edit, reject or finish a promotion step',
      description:
        'Only steps of the latest version change. Editing marks the step as written by the artist.',
    }),
    ReleaseParam,
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiBody({ type: UpdatePromotionStepDto }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or step not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'The step changed, the action does not apply, or the plan was replaced',
    }),
  )
}
