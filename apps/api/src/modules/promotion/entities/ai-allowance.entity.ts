import { ApiProperty } from '@nestjs/swagger'

export class AiAllowanceEntity {
  @ApiProperty({ description: 'Spent this month, in micro-dollars (US$ 1 = 1,000,000)' })
  usedMicroUsd: number

  @ApiProperty({ description: 'Monthly ceiling, in micro-dollars' })
  limitMicroUsd: number

  @ApiProperty({ type: String, format: 'date-time' })
  resetsAt: Date

  @ApiProperty({
    description: 'AI promotion is switched on for this artist; otherwise the UI hides it',
  })
  enabled: boolean
}
