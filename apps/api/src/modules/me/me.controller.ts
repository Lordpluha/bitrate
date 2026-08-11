import { normalizePagination } from '@common/pagination'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  UpdatePlayerDto,
  UpdatePlayerSchema,
  UpdateQueueDto,
  UpdateQueueSchema,
  UpdateSettingsDto,
  UpdateSettingsSchema,
  UpsertDeviceDto,
  UpsertDeviceSchema,
} from './dtos'
import { MeService } from './me.service'

@ApiTags('Me')
@UserAuth()
@Controller({ path: 'me', version: '1' })
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get('settings')
  getSettings(@Req() req: UserAuthRequest) {
    return this.me.getSettings(req.user.id)
  }

  @Put('settings')
  updateSettings(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(UpdateSettingsSchema)) dto: UpdateSettingsDto,
  ) {
    return this.me.updateSettings(req.user.id, dto)
  }

  @Get('player')
  getPlayer(@Req() req: UserAuthRequest) {
    return this.me.getPlayer(req.user.id)
  }

  @Put('player')
  updatePlayer(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(UpdatePlayerSchema)) dto: UpdatePlayerDto,
  ) {
    return this.me.updatePlayer(req.user.id, dto)
  }

  @Put('player/queue')
  updateQueue(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(UpdateQueueSchema)) dto: UpdateQueueDto,
  ) {
    return this.me.replaceQueue(req.user.id, dto)
  }

  @Get('player/devices')
  devices(@Req() req: UserAuthRequest) {
    return this.me.getDevices(req.user.id)
  }

  @Post('player/devices')
  upsertDevice(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(UpsertDeviceSchema)) dto: UpsertDeviceDto,
  ) {
    return this.me.upsertDevice(req.user.id, dto)
  }

  @HttpCode(204)
  @Delete('player/devices/:id')
  removeDevice(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.me.removeDevice(req.user.id, id)
  }

  @Get('notifications')
  notifications(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const pagination = normalizePagination(page, limit)
    return this.me.getNotifications(req.user.id, pagination.page, pagination.limit)
  }

  @HttpCode(204)
  @Put('notifications/:id/read')
  readNotification(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.me.readNotification(req.user.id, id)
  }

  @HttpCode(204)
  @Put('notifications/read-all')
  readAll(@Req() req: UserAuthRequest) {
    return this.me.readAllNotifications(req.user.id)
  }

  @Get('subscription')
  subscription(@Req() req: UserAuthRequest) {
    return this.me.getSubscription(req.user.id)
  }
}
