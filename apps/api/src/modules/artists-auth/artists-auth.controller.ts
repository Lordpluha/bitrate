import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistAuth } from './artists-auth.guard'
import { ArtistsAuthService } from './artists-auth.service'
import {
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthMeSwagger,
  AuthRefreshSwagger,
  AuthRegistrationSwagger,
} from './decorators'
import { type LoginDto, LoginSchema, type RegistrationDto, RegistrationSchema } from './dtos'
import { ArtistSessionEntity } from './entities'
import type { ArtistAuthRequest } from './types'

@ApiExtraModels(ArtistSessionEntity)
@ApiTags('Artists Auth')
@Controller('artists/auth')
export class AuthController {
  constructor(
    private artistAuthService: ArtistsAuthService,
    private artistService: ArtistsService,
    private tokenService: TokenService,
  ) {}

  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.artistAuthService.loginArtist(
      loginDto.email,
      loginDto.password,
    )

    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  @AuthRegistrationSwagger()
  @Post('registration')
  async registration(
    @Body(new ZodValidationPipe(RegistrationSchema))
    registrationDto: RegistrationDto,
  ) {
    await this.artistAuthService.registerArtist(registrationDto)
  }

  @AuthLogoutSwagger()
  @ArtistAuth()
  @Post('logout')
  async logout(@Req() req: ArtistAuthRequest & Request, @Res({ passthrough: true }) res: Response) {
    const access_token = req[process.env.ACCESS_TOKEN_NAME!] as string
    await this.artistAuthService.logout(req.artist.id, access_token)
    this.tokenService.clearAuthCookies(res)
  }

  @AuthRefreshSwagger()
  @ArtistAuth('refresh')
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req[process.env.REFRESH_TOKEN_NAME!] as string
    const { access_token } = await this.artistAuthService.refresh(refresh_token)
    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  @AuthMeSwagger()
  @ArtistAuth()
  @Get('me')
  async getMe(@Req() req: ArtistAuthRequest) {
    return await this.artistService.findById(req.artist.id)
  }
}
