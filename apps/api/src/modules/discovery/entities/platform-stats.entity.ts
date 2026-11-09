import { ApiProperty } from '@nestjs/swagger'
import type { PlatformStats } from '../platform-stats.service'

/** Public platform totals shown on the landing. */
export class PlatformStatsEntity implements PlatformStats {
  /** Artist accounts that are not deleted. */
  @ApiProperty({ example: 42 })
  artists: number

  /** Listener accounts that are not deleted. */
  @ApiProperty({ example: 1280 })
  listeners: number

  /** Tracks a listener can find and play right now. */
  @ApiProperty({ example: 5600 })
  tracks: number
}
