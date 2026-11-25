import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { SupportTelegramService } from './support-telegram.service'

/** Telegram's webhook for the support bot (#574). */
@Controller({ path: 'support/telegram', version: '1' })
export class SupportTelegramController {
  constructor(private readonly telegram: SupportTelegramService) {}

  /**
   * Answers 200 for every authentic update, handled or ignored, so Telegram does not redeliver
   * it. Only Telegram calls it: not in the public contract, and not throttled per IP, since every
   * update comes from Telegram's few servers.
   */
  @ApiExcludeEndpoint()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  async webhook(
    @Headers('x-telegram-bot-api-secret-token') secret: string | undefined,
    @Body() body: unknown,
  ): Promise<void> {
    await this.telegram.accept(secret, body)
  }
}
