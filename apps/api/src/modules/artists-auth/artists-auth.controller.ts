import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import { UserEntity } from '@modules/users'
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
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
import { LoginDto, LoginSchema, RegistrationDto, RegistrationSchema } from './dtos'
import { ArtistSessionEntity } from './entities'

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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req['user'] as UserEntity
    const access_token = req[process.env.ACCESS_TOKEN_NAME!] as string
    await this.artistAuthService.logout(user.id, access_token)
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
  async getMe(@Req() req: Request) {
    const user = req['user'] as UserEntity
    return await this.artistService.findById(user.id)
  }
}
