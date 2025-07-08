import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { UserEntity } from '../users/entities'
import { JWTPayload } from './types'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async registration(registrationDto: Pick<UserEntity, 'email' | 'password'>) {
    if (await this.usersService.findUserByEmail(registrationDto.email)) {
      throw new ConflictException('User with this email already exists')
    }

    return this.usersService.createUser({
      username: registrationDto.email,
      email: registrationDto.email,
      password: registrationDto.password
    })
  }

  async login(email: UserEntity['email'], password: UserEntity['password']) {
    const user = await this.usersService.findUserByEmail(email)
    if (user?.password !== password) {
      throw new UnauthorizedException()
    }
    return {
      access_token: await this.jwtService.signAsync(
        {
          username: user.username
        },
        {
          subject: user.id
        }
      ),
      refresh_token: await this.jwtService.signAsync(
        {
          username: user.username
        },
        {
          subject: user.id,
          expiresIn: '7d' // Refresh token expiration
        }
      )
    }
  }

  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(
        refresh_token,
        {
          secret: process.env.REFRESH_TOKEN_SECRET
        }
      )
      const user = await this.usersService.findUserByUsername(payload.username)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      return {
        access_token: await this.jwtService.signAsync(
          {
            username: user.username
          },
          {
            subject: user.id
          }
        )
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout() {
    return Promise.resolve({ message: 'Logout successful' });
  }
}
