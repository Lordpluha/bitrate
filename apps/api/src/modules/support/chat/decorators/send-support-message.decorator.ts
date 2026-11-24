import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger'
import { SendSupportMessageDto } from '../dtos/send-support-message.dto'
import { SUPPORT_TOKEN_HEADER } from '../guest-token'

export function SendSupportMessageSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Send a message and stream the reply',
      description:
        'Server-Sent Events. Each event is named after its `type` and carries JSON: `text-delta` `{ text }`, `state` `{ state, reason? }`, `citation` `{ citation }`, and last `done` `{ outcome, grounded }`. While an operator owns the conversation the message is stored and only `done` with outcome `forwarded` follows.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiHeader({ name: SUPPORT_TOKEN_HEADER, required: false, description: 'Guest token' }),
    ApiBody({ type: SendSupportMessageDto }),
    ApiProduces('text/event-stream'),
    ApiResponse({ status: HttpStatus.OK, description: 'The event stream' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Missing, or not the caller’s' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'A reply is still streaming' }),
    ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, description: 'Too many messages' }),
  )
}
