import { PrismaService } from '@infra/prisma/prisma.service'
import { ArtistEntity } from '@modules/artists'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ArtistSession } from '@prisma/client'
import { JWTPayload } from '../tokens'
import { RegistrationDto } from './dtos'
import { ArtistSessionEntity } from './entities'

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
      password: registrationDto.password,
    })
  }

  async loginArtist(email: ArtistEntity['email'], password: ArtistEntity['password']) {
    const artist = await this.artistsPrivate.findByEmail(email)
    if (!artist || artist?.password !== password) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      })
    }

    const access_token = await this.token.generateAccessToken(artist.id, artist.username)
    const refresh_token = await this.token.generateRefreshToken(artist.id, artist.username)

    const session = await this.prisma.artistSession.create({
      data: {
        access_token,
        artistId: artist.id,
        refresh_token,
      },
    })

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }
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
      return {
        access_token: await this.token.generateAccessToken(user.id, user.username),
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(
    artistId: ArtistSession['artistId'],
    refresh_token: ArtistSessionEntity['refresh_token'],
  ) {
    const artist = await this.artists.findById(artistId)
    if (!artist) {
      throw new UnauthorizedException('Invalid access token')
    }
    const session = await this.prisma.artistSession.findFirst({
      where: {
        artistId: artist.id,
        refresh_token,
      },
    })

    await this.prisma.artistSession.delete({
      where: {
        id: session?.id,
      },
    })
  }
}
