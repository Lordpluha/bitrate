import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { TokenService } from './token.service'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { UserEntity } from '../users/entities'
import { RegistrationDto } from './dtos'

describe('AuthService', () => {
  let service: AuthService

  const mockUser: UserEntity = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    avatar: null,
    description: null,
    createdAt: new Date()
  }

  const mockUserWithPassword = {
    ...mockUser,
    password: 'password123'
  }

  const mockSession = {
    id: 'session-1',
    access_token: 'access_token_123',
    refresh_token: 'refresh_token_123',
    userId: '1',
    createdAt: new Date()
  }

  const mockUsersService = {
    getByEmail: jest.fn(),
    getByEmail_UNSECURE: jest.fn(),
    getByUsername: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  }

  const mockJwtService = {
    verifyAsync: jest.fn()
  }

  const mockPrismaService = {
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn()
    }
  }

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('registerUser', () => {
    const registrationDto: RegistrationDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    }

    it('should register a new user successfully', async () => {
      mockUsersService.getByEmail.mockResolvedValue(null)
      mockUsersService.create.mockResolvedValue(undefined)

      await service.registerUser(registrationDto)

      expect(mockUsersService.getByEmail).toHaveBeenCalledWith(
        registrationDto.email
      )
      expect(mockUsersService.create).toHaveBeenCalledWith({
        username: registrationDto.username,
        email: registrationDto.email,
        password: registrationDto.password,
        avatar: null,
        description: null
      })
    })

    it('should throw ConflictException when user already exists', async () => {
      mockUsersService.getByEmail.mockResolvedValue(mockUser)

      await expect(service.registerUser(registrationDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      )

      expect(mockUsersService.getByEmail).toHaveBeenCalledWith(
        registrationDto.email
      )
      expect(mockUsersService.create).not.toHaveBeenCalled()
    })
  })

  describe('loginUser', () => {
    const email = 'test@example.com'
    const password = 'password123'

    it('should login user successfully', async () => {
      const tokens = {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123'
      }

      mockUsersService.getByEmail_UNSECURE.mockResolvedValue(
        mockUserWithPassword
      )
      mockTokenService.generateAccessToken.mockResolvedValue(
        tokens.access_token
      )
      mockTokenService.generateRefreshToken.mockResolvedValue(
        tokens.refresh_token
      )
      mockPrismaService.session.create.mockResolvedValue(mockSession)

      const result = await service.loginUser(email, password)

      expect(mockUsersService.getByEmail_UNSECURE).toHaveBeenCalledWith(email)
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.username
      )
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.username
      )
      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: {
          access_token: tokens.access_token,
          userId: mockUser.id,
          refresh_token: tokens.refresh_token
        }
      })
      expect(result).toEqual({
        access_token: mockSession.access_token,
        refresh_token: mockSession.refresh_token
      })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.getByEmail_UNSECURE.mockResolvedValue(null)

      await expect(service.loginUser(email, password)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Invalid credentials'
        })
      )

      expect(mockUsersService.getByEmail_UNSECURE).toHaveBeenCalledWith(email)
      expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled()
      expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled()
      expect(mockPrismaService.session.create).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const userWithWrongPassword = {
        ...mockUserWithPassword,
        password: 'wrong_password'
      }
      mockUsersService.getByEmail_UNSECURE.mockResolvedValue(
        userWithWrongPassword
      )

      await expect(service.loginUser(email, password)).rejects.toThrow(
        new UnauthorizedException({
          message: 'Invalid credentials'
        })
      )

      expect(mockUsersService.getByEmail_UNSECURE).toHaveBeenCalledWith(email)
      expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled()
      expect(mockTokenService.generateRefreshToken).not.toHaveBeenCalled()
      expect(mockPrismaService.session.create).not.toHaveBeenCalled()
    })
  })

  describe('refresh', () => {
    const refreshToken = 'valid_refresh_token'
    const jwtPayload = {
      sub: mockUser.id,
      username: mockUser.username
    }

    it('should refresh tokens successfully', async () => {
      const newAccessToken = 'new_access_token'

      mockJwtService.verifyAsync.mockResolvedValue(jwtPayload)
      mockUsersService.getByUsername.mockResolvedValue(mockUser)
      mockTokenService.generateAccessToken.mockResolvedValue(newAccessToken)

      const result = await service.refresh(refreshToken)

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET
      })
      expect(mockUsersService.getByUsername).toHaveBeenCalledWith(
        mockUser.username
      )
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.username
      )
      expect(result).toEqual({
        access_token: newAccessToken
      })
    })

    it('should throw UnauthorizedException when user not found by username', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(jwtPayload)
      mockUsersService.getByUsername.mockResolvedValue(null)

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      )

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET
      })
      expect(mockUsersService.getByUsername).toHaveBeenCalledWith(
        mockUser.username
      )
      expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'))

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      )

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET
      })
      expect(mockUsersService.getByUsername).not.toHaveBeenCalled()
      expect(mockTokenService.generateAccessToken).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    const userId = '1'
    const refreshToken = 'refresh_token_123'

    it('should logout user successfully', async () => {
      const mockFoundSession = {
        id: 'session-1',
        userId: '1',
        refresh_token: refreshToken
      }

      mockUsersService.findById.mockResolvedValue(mockUser)
      mockPrismaService.session.findFirst.mockResolvedValue(mockFoundSession)
      mockPrismaService.session.delete.mockResolvedValue(mockFoundSession)

      await service.logout(userId, refreshToken)

      expect(mockUsersService.findById).toHaveBeenCalledWith(userId)
      expect(mockPrismaService.session.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          refresh_token: refreshToken
        }
      })
      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({
        where: {
          id: mockFoundSession.id
        }
      })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null)

      await expect(service.logout(userId, refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid access token')
      )

      expect(mockUsersService.findById).toHaveBeenCalledWith(userId)
      expect(mockPrismaService.session.findFirst).not.toHaveBeenCalled()
      expect(mockPrismaService.session.delete).not.toHaveBeenCalled()
    })

    it('should handle logout when session is not found', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser)
      mockPrismaService.session.findFirst.mockResolvedValue(null)
      mockPrismaService.session.delete.mockResolvedValue(null)

      await service.logout(userId, refreshToken)

      expect(mockUsersService.findById).toHaveBeenCalledWith(userId)
      expect(mockPrismaService.session.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          refresh_token: refreshToken
        }
      })
      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({
        where: {
          id: undefined
        }
      })
    })
  })
})
