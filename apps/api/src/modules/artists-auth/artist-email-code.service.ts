import { createHash, createHmac, randomInt } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { REDIS_CLIENT } from '@infra/cache/cache.constants'
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Redis } from 'ioredis'

const CODE_TTL_SECONDS = 10 * 60
const RESEND_COOLDOWN_SECONDS = 60
const MAX_ATTEMPTS = 5
// Resending rotates the code but not this budget, so guessing cannot continue indefinitely.
// The emailed link still verifies an account that exhausted it.
const MAX_DAILY_FAILURES = 20
const FAILURE_WINDOW_SECONDS = 24 * 60 * 60

// Issuing and consuming are atomic across API replicas. A code can be consumed only once.
const ISSUE_CODE = `
redis.call('DEL', KEYS[1])
redis.call('HSET', KEYS[1], 'hash', ARGV[1], 'attempts', 0)
redis.call('EXPIRE', KEYS[1], ARGV[2])
return 1
`
const CONSUME_CODE = `
if tonumber(redis.call('GET', KEYS[2]) or '0') >= tonumber(ARGV[3]) then return 0 end
local hash = redis.call('HGET', KEYS[1], 'hash')
if not hash then return 0 end
local attempts = redis.call('HINCRBY', KEYS[1], 'attempts', 1)
if attempts > tonumber(ARGV[2]) then return 0 end
if hash == ARGV[1] then
  redis.call('DEL', KEYS[1], KEYS[2])
  return 1
end
if redis.call('INCR', KEYS[2]) == 1 then redis.call('EXPIRE', KEYS[2], ARGV[4]) end
if attempts >= tonumber(ARGV[2]) then redis.call('DEL', KEYS[1]) end
return 0
`

/** Stores short-lived, keyed code hashes separately from existing verification links. */
@Injectable()
export class ArtistEmailCodeService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  async issue(artistId: string): Promise<string> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
    await this.redis.eval(
      ISSUE_CODE,
      1,
      this.key(artistId),
      this.hash(artistId, code),
      CODE_TTL_SECONDS,
    )
    return code
  }

  async consume(artistId: string, code: string): Promise<void> {
    const consumed = await this.redis.eval(
      CONSUME_CODE,
      2,
      this.key(artistId),
      `artist-email-code-failures:${artistId}`,
      this.hash(artistId, code),
      MAX_ATTEMPTS,
      MAX_DAILY_FAILURES,
      FAILURE_WINDOW_SECONDS,
    )
    if (consumed !== 1) throw new BadRequestException('Invalid or expired verification code')
  }

  /** Applies the same cooldown to every email, including unknown and verified accounts. */
  async reserveResend(email: string): Promise<void> {
    const addressHash = createHash('sha256').update(email).digest('hex')
    const reserved = await this.redis.set(
      `artist-email-resend:${addressHash}`,
      '1',
      'EX',
      RESEND_COOLDOWN_SECONDS,
      'NX',
    )
    if (!reserved)
      throw new HttpException(
        'Please wait before requesting another code',
        HttpStatus.TOO_MANY_REQUESTS,
      )
  }

  private key(artistId: string): string {
    return `artist-email-code:${artistId}`
  }

  private hash(artistId: string, code: string): string {
    return createHmac('sha256', this.config.getOrThrow('JWT_SECRET'))
      .update(`artist-email-code:${artistId}:${code}`)
      .digest('hex')
  }
}
