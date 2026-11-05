import { normalizePagination } from '@common/pagination'
import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
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
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  GetDevicesSwagger,
  GetNotificationsSwagger,
  GetPlayerSwagger,
  GetSettingsSwagger,
  GetSubscriptionSwagger,
  ReadAllNotificationsSwagger,
  ReadNotificationSwagger,
  RemoveDeviceSwagger,
  UpdatePlayerSwagger,
  UpdateQueueSwagger,
  UpdateSettingsSwagger,
  UpsertDeviceSwagger,
} from './decorators'
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

  @GetSettingsSwagger()
  @Get('settings')
  getSettings(@CurrentUser() user: UserEntity) {
    return this.me.getSettings(user.id)
  }

  @UpdateSettingsSwagger()
  @Put('settings')
  updateSettings(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(UpdateSettingsSchema)) dto: UpdateSettingsDto,
  ) {
    return this.me.updateSettings(user.id, dto)
  }

  @GetPlayerSwagger()
  @Get('player')
  getPlayer(@CurrentUser() user: UserEntity) {
    return this.me.getPlayer(user.id)
  }

  @UpdatePlayerSwagger()
  @Put('player')
  updatePlayer(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(UpdatePlayerSchema)) dto: UpdatePlayerDto,
  ) {
    return this.me.updatePlayer(user.id, dto)
  }

  @UpdateQueueSwagger()
  @Put('player/queue')
  updateQueue(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(UpdateQueueSchema)) dto: UpdateQueueDto,
  ) {
    return this.me.replaceQueue(user.id, dto)
  }

  @GetDevicesSwagger()
  @Get('player/devices')
  devices(@CurrentUser() user: UserEntity) {
    return this.me.getDevices(user.id)
  }

  @UpsertDeviceSwagger()
  @Post('player/devices')
  upsertDevice(
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(UpsertDeviceSchema)) dto: UpsertDeviceDto,
  ) {
    return this.me.upsertDevice(user.id, dto)
  }

  @RemoveDeviceSwagger()
  @HttpCode(204)
  @Delete('player/devices/:id')
  removeDevice(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.me.removeDevice(user.id, id)
  }

  @GetNotificationsSwagger()
  @Get('notifications')
  notifications(
    @CurrentUser() user: UserEntity,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const pagination = normalizePagination(page, limit)
    return this.me.getNotifications(user.id, pagination.page, pagination.limit)
  }

  @ReadNotificationSwagger()
  @HttpCode(204)
  @Put('notifications/:id/read')
  readNotification(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.me.readNotification(user.id, id)
  }

  @ReadAllNotificationsSwagger()
  @HttpCode(204)
  @Put('notifications/read-all')
  readAll(@CurrentUser() user: UserEntity) {
    return this.me.readAllNotifications(user.id)
  }

  @GetSubscriptionSwagger()
  @Get('subscription')
  subscription(@CurrentUser() user: UserEntity) {
    return this.me.getSubscription(user.id)
  }
}
