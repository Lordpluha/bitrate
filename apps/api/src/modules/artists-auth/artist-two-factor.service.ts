import { selectTwoFAFields, TwoFactorCore, type TwoFactorUpdate } from '@modules/auth-core'
import { Injectable, UnauthorizedException } from '@nestjs/common'

/** Represents the artist two factor service. */
@Injectable()
export class ArtistTwoFactorService extends TwoFactorCore {
  protected findState(artistId: string) {
    return this.prisma.artist.findUniqueOrThrow({
      where: { id: artistId },
      select: selectTwoFAFields,
    })
  }

  /** A pending login for a soft-deleted artist is refused rather than completed. */
  protected async findStateForLogin(artistId: string) {
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      select: selectTwoFAFields,
    })
    if (!artist) throw new UnauthorizedException('Artist account is unavailable')
    return artist
  }

  protected saveState(artistId: string, data: TwoFactorUpdate) {
    return this.prisma.artist.update({ where: { id: artistId }, data })
  }
}
