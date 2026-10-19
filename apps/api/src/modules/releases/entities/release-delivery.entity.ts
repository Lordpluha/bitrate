import { ApiProperty } from '@nestjs/swagger'
import { DeliveryDestination, ReleaseStatus } from '@prisma/client'
import { ReleaseEntity } from './release.entity'

export class DistributionPartnerEntity {
  @ApiProperty({ description: 'False until a distribution partner is connected' })
  connected: boolean

  @ApiProperty({ type: String, nullable: true })
  name: string | null
}

export class DeliveryTerritoriesEntity {
  @ApiProperty({ enum: ['WORLDWIDE', 'SELECTED'], enumName: 'DeliveryTerritoryMode' })
  mode: 'WORLDWIDE' | 'SELECTED'

  @ApiProperty({ type: [String], example: ['UA', 'PL'], description: 'Empty when worldwide' })
  countries: string[]
}

export class DeliveryDestinationEntity {
  @ApiProperty({ enum: DeliveryDestination, enumName: 'DeliveryDestination' })
  destination: DeliveryDestination

  @ApiProperty({ description: 'Chosen in the delivery plan' })
  planned: boolean

  @ApiProperty({
    enum: ['NOT_CONNECTED', 'UNAVAILABLE', 'NOT_SENT', 'PENDING', 'LIVE', 'FAILED', 'TAKEN_DOWN'],
    enumName: 'DestinationAvailability',
    description: 'NOT_CONNECTED and UNAVAILABLE mean nothing was or can be sent',
  })
  availability:
    | 'NOT_CONNECTED'
    | 'UNAVAILABLE'
    | 'NOT_SENT'
    | 'PENDING'
    | 'LIVE'
    | 'FAILED'
    | 'TAKEN_DOWN'

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Partner message, for example a failure reason',
  })
  message: string | null

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null
}

export class ReleaseDeliveryEntity {
  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty()
  title: string

  @ApiProperty({ enum: ReleaseStatus, enumName: 'ReleaseStatus' })
  status: ReleaseStatus

  @ApiProperty({ type: String, nullable: true })
  cover: string | null

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date

  @ApiProperty({ type: DistributionPartnerEntity })
  partner: DistributionPartnerEntity

  @ApiProperty({ type: DeliveryTerritoriesEntity })
  territories: DeliveryTerritoriesEntity

  @ApiProperty({ type: [DeliveryDestinationEntity] })
  destinations: DeliveryDestinationEntity[]

  @ApiProperty({ description: 'Whether anything was ever sent to a partner' })
  sent: boolean
}

export class DeliveryPlanUpdatedEntity {
  @ApiProperty({ type: ReleaseEntity })
  release: ReleaseEntity

  @ApiProperty({ type: ReleaseDeliveryEntity })
  delivery: ReleaseDeliveryEntity
}

export class DistributionPageEntity {
  @ApiProperty({ type: [ReleaseDeliveryEntity] })
  data: ReleaseDeliveryEntity[]

  @ApiProperty({ minimum: 0 })
  total: number

  @ApiProperty({ minimum: 1 })
  page: number

  @ApiProperty({ minimum: 1, maximum: 100 })
  limit: number
}
