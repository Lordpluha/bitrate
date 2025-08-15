import { Test, TestingModule } from '@nestjs/testing'
import { AlbumsModule } from './albums.module'
import { AlbumsController } from './albums.controller'
import { AlbumsService } from './albums.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '../auth/auth.guard'
import { Reflector } from '@nestjs/core'
import { TokenService } from '../auth/token.service'

describe('AlbumsModule', () => {
  let module: TestingModule

  const mockPrismaService = {
    album: { findMany: jest.fn() },
    artist: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    session: { findFirst: jest.fn() }
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn()
  }

  const mockTokenService = {
    verifyToken: jest.fn()
  }

  const mockReflector = {
    getAllAndOverride: jest.fn()
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AlbumsModule]
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(TokenService)
      .useValue(mockTokenService)
      .overrideProvider(Reflector)
      .useValue(mockReflector)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()
  })

  afterEach(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })

  it('should have AlbumsController', () => {
    const controller = module.get<AlbumsController>(AlbumsController)
    expect(controller).toBeDefined()
  })

  it('should have AlbumsService', () => {
    const service = module.get<AlbumsService>(AlbumsService)
    expect(service).toBeDefined()
  })

  it('should export AlbumsService', () => {
    const exportedService = module.get<AlbumsService>(AlbumsService)
    expect(exportedService).toBeDefined()
    expect(exportedService).toBeInstanceOf(AlbumsService)
  })
})
