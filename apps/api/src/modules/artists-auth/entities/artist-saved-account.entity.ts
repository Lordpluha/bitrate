import { ApiProperty } from '@nestjs/swagger'
export class ArtistSavedAccountEntity {
  @ApiProperty({ format: 'uuid' })
  id: string
  @ApiProperty()
  username: string
  @ApiProperty({ type: String, nullable: true })
  avatar: string | null
  @ApiProperty()
  current: boolean
}
export class ArtistSavedAccountsEntity {
  @ApiProperty({ type: [ArtistSavedAccountEntity] })
  accounts: ArtistSavedAccountEntity[]
  @ApiProperty({ minimum: 1 })
  limit: number
}
