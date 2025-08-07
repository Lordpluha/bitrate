import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { TokenService } from './token.service'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { Request, Response } from 'express'
import { UserEntity } from '../users/entities'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

interface RequestWithUser extends Request {
  user?: UserEntity
  [key: string]: unknown
}

describe('AuthController', () => {
  let controller: AuthController

  const mockUser: UserEntity = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    avatar: null,
    description: null,
    createdAt: new Date()
  }

  const mockTokens = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token'
  }

  const mockAuthService = {
    loginUser: jest.fn(),
    registerUser: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn()
  }

  const mockUsersService = {
    findById: jest.fn(),
    getByEmail: jest.fn(),
    getByEmail_UNSECURE: jest.fn(),
    getByUsername: jest.fn(),
    create: jest.fn()
  }

  const mockTokenService = {
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyToken: jest.fn()
  }

  const mockPrismaService = {
    user: {
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn()
    }
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  }

  const createMockResponse = (): Response => {
    const res = {} as Response
    res.cookie = jest.fn().mockReturnValue(res)
    res.clearCookie = jest.fn().mockReturnValue(res)
    return res
  }

  const createMockRequest = (user: UserEntity): RequestWithUser => {
    const req = {} as RequestWithUser
    req.user = user
    req[process.env.ACCESS_TOKEN_NAME || 'access_token'] = 'mock_access_token'
    req[process.env.REFRESH_TOKEN_NAME || 'refresh_token'] =
      'mock_refresh_token'
    return req
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ]
    }).compile()

    controller = module.get<AuthController>(AuthController)

    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123'
    }

    it('should login user successfully', async () => {
      const mockResponse = createMockResponse()
      mockAuthService.loginUser.mockResolvedValue(mockTokens)

      await controller.login(loginDto, mockResponse)

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      )
      expect(mockTokenService.setAuthCookies).toHaveBeenCalledWith(
        mockResponse,
        mockTokens.access_token,
        mockTokens.refresh_token
      )
    })

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const mockResponse = createMockResponse()
      const error = new UnauthorizedException('Invalid credentials')
      mockAuthService.loginUser.mockRejectedValue(error)

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        UnauthorizedException
      )

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      )
      expect(mockTokenService.setAuthCookies).not.toHaveBeenCalled()
    })
  })

  describe('registration', () => {
    const registrationDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser'
    }

    it('should register user successfully', async () => {
      mockAuthService.registerUser.mockResolvedValue(undefined)

      await controller.registration(registrationDto)

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(registrationDto)
    })

    it('should throw ConflictException when user already exists', async () => {
      const error = new ConflictException('User with this email already exists')
      mockAuthService.registerUser.mockRejectedValue(error)

      await expect(controller.registration(registrationDto)).rejects.toThrow(
        ConflictException
      )

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(registrationDto)
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockRequest = createMockRequest(mockUser)
      const mockResponse = createMockResponse()
      mockAuthService.logout.mockResolvedValue(undefined)

      await controller.logout(mockRequest as Request, mockResponse)

      expect(mockAuthService.logout).toHaveBeenCalledWith(
        mockUser.id,
        mockRequest[process.env.ACCESS_TOKEN_NAME || 'access_token']
      )
      expect(mockTokenService.clearAuthCookies).toHaveBeenCalledWith(
        mockResponse
      )
    })

    it('should handle logout when user not found', async () => {
      const mockRequest = createMockRequest(mockUser)
      const mockResponse = createMockResponse()
      const error = new UnauthorizedException('Invalid access token')
      mockAuthService.logout.mockRejectedValue(error)

      await expect(
        controller.logout(mockRequest as Request, mockResponse)
      ).rejects.toThrow(UnauthorizedException)

      expect(mockAuthService.logout).toHaveBeenCalledWith(
        mockUser.id,
        mockRequest[process.env.ACCESS_TOKEN_NAME || 'access_token']
      )
      expect(mockTokenService.clearAuthCookies).not.toHaveBeenCalled()
    })
  })

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockRequest = createMockRequest(mockUser)
      const mockResponse = createMockResponse()
      const newAccessToken = { access_token: 'new_access_token' }
      mockAuthService.refresh.mockResolvedValue(newAccessToken)

      await controller.refresh(mockRequest as Request, mockResponse)

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        mockRequest[process.env.REFRESH_TOKEN_NAME || 'refresh_token']
      )
      expect(mockTokenService.setAuthCookies).toHaveBeenCalledWith(
        mockResponse,
        newAccessToken.access_token,
        mockRequest[process.env.REFRESH_TOKEN_NAME || 'refresh_token']
      )
    })

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const mockRequest = createMockRequest(mockUser)
      const mockResponse = createMockResponse()
      const error = new UnauthorizedException('Invalid refresh token')
      mockAuthService.refresh.mockRejectedValue(error)

      await expect(
        controller.refresh(mockRequest as Request, mockResponse)
      ).rejects.toThrow(UnauthorizedException)

      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        mockRequest[process.env.REFRESH_TOKEN_NAME || 'refresh_token']
      )
      expect(mockTokenService.setAuthCookies).not.toHaveBeenCalled()
    })
  })

  describe('getMe', () => {
    it('should return current user successfully', async () => {
      const mockRequest = createMockRequest(mockUser)
      const publicUser = {
        id: mockUser.id,
        username: mockUser.username,
        avatar: mockUser.avatar,
        description: mockUser.description,
        createdAt: mockUser.createdAt
      }
      mockUsersService.findById.mockResolvedValue(publicUser)

      const result = await controller.getMe(mockRequest as Request)

      expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id)
      expect(result).toEqual(publicUser)
    })

    it('should handle when user not found', async () => {
      const mockRequest = createMockRequest(mockUser)
      // Since findUniqueOrThrow throws when user not found,
      // we should test the error case differently
      const error = new Error('User not found')
      mockUsersService.findById.mockRejectedValue(error)

      await expect(controller.getMe(mockRequest as Request)).rejects.toThrow()

      expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id)
    })
  })
})
