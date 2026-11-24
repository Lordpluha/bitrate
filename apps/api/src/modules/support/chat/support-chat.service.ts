import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Redis } from 'ioredis'
import type { SupportAccess } from './can-access-conversation'
import { SUPPORT_ERRORS } from './errors/support.errors'
import { formatEvent } from './sse/format-event'
import { openEventStream } from './sse/open-event-stream'
import { SupportConversationsService } from './support-conversations.service'
import { SupportTurnService } from './support-turn.service'
import { acquireTurnLock } from './support-turn-lock'

/**
 * Streams one turn to the client. Access and the per-conversation lock are checked before the
 * stream opens, so those failures stay ordinary HTTP errors; after that, problems end the
 * stream with an `error` frame. A client that disconnects cancels the model call.
 */
@Injectable()
export class SupportChatService {
  private readonly logger = new Logger(SupportChatService.name)

  constructor(
    private readonly conversations: SupportConversationsService,
    private readonly turns: SupportTurnService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async stream(id: string, access: SupportAccess, text: string, req: Request, res: Response) {
    const conversation = await this.conversations.forTurn(id, access)
    const release = await acquireTurnLock(this.redis, conversation.id)
    if (!release) throw new ConflictException(SUPPORT_ERRORS.TURN_IN_PROGRESS)

    const abort = new AbortController()
    const onClose = () => {
      if (!res.writableEnded) abort.abort()
    }
    req.on('close', onClose)
    try {
      openEventStream(res)
      for await (const event of this.turns.run(conversation, text, abort.signal)) {
        res.write(formatEvent(event))
      }
    } catch (error: unknown) {
      this.logger.error(`Support stream ${conversation.id} failed: ${String(error)}`)
      if (!res.writableEnded) res.write('event: error\ndata: {"code":"stream_failed"}\n\n')
    } finally {
      req.off('close', onClose)
      await release()
      res.end()
    }
  }
}
