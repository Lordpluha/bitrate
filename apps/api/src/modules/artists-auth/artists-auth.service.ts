import { PrismaService } from '@infra/prisma/prisma.service'
import type { ArtistEntity } from '@modules/artists'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { ArtistSession } from '@prisma/client'
import type { JWTPayload } from '../tokens'
import type { RegistrationDto } from './dtos'
import type { ArtistSessionEntity } from './entities'

@Injectable()
export class ArtistsAuthService {
  constructor(
    private artists: ArtistsService,
    private artistsPrivate: ArtistsPrivateService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
  ) {}

  async registerArtist(registrationDto: RegistrationDto) {
    const artist = await this.artists.findByEmail(registrationDto.email)

    if (artist) {
      throw new ConflictException('Artist with this email already exists')
    }

    await this.artists.register({
      username: registrationDto.username,
      email: registrationDto.email,
      password: await this.token.hashPassword(registrationDto.password),
    })
  }

  async loginArtist(email: ArtistEntity['email'], password: ArtistEntity['password']) {
    const artist = await this.artistsPrivate.findByEmail(email)
    const passwordValid = artist && (await this.token.verifyPassword(password, artist.password))
    if (!passwordValid) {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    const access_token = await this.token.generateAccessToken(artist.id, artist.username)
    const refresh_token = await this.token.generateRefreshToken(artist.id, artist.username)

    await this.prisma.artistSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        artistId: artist.id,
      },
    })

    return { access_token, refresh_token }
  }

  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      const user = await this.artists.findByUsername(payload.username)
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const access_token = await this.token.generateAccessToken(user.id, user.username)

      await this.prisma.artistSession.updateMany({
        where: {
          artistId: user.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: {
          access_token: this.token.hashToken(access_token),
        },
      })

      return { access_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(
    artistId: ArtistSession['artistId'],
    access_token: ArtistSessionEntity['access_token'],
  ) {
    const artist = await this.artists.findById(artistId)
    if (!artist) {
      throw new UnauthorizedException('Invalid access token')
    }

    await this.prisma.artistSession.deleteMany({
      where: {
        artistId: artist.id,
        access_token: this.token.hashToken(access_token),
      },
    })
  }
}
