import { Test, TestingModule } from '@nestjs/testing'
import { ArtistsModule } from './artists.module'
import { ArtistsController } from './artists.controller'
import { ArtistsService } from './artists.service'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '../auth/auth.guard'
import { Reflector } from '@nestjs/core'
import { TokenService } from '../auth/token.service'

describe('ArtistsModule', () => {
  let module: TestingModule

  const mockPrismaService = {
    artist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
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
      imports: [ArtistsModule]
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

  it('should have ArtistsController', () => {
    const controller = module.get<ArtistsController>(ArtistsController)
    expect(controller).toBeDefined()
  })

  it('should have ArtistsService', () => {
    const service = module.get<ArtistsService>(ArtistsService)
    expect(service).toBeDefined()
  })

  it('should export ArtistsService', () => {
    const exportedService = module.get<ArtistsService>(ArtistsService)
    expect(exportedService).toBeDefined()
    expect(exportedService).toBeInstanceOf(ArtistsService)
  })

  it('should have correct imports', () => {
    // The module should compile without errors if imports are correct
    expect(module).toBeDefined()
  })

  it('should properly inject dependencies', () => {
    const controller = module.get<ArtistsController>(ArtistsController)
    const service = module.get<ArtistsService>(ArtistsService)

    expect(controller).toBeDefined()
    expect(service).toBeDefined()

    // Verify that both controller and service are instances of their respective classes
    expect(controller).toBeInstanceOf(ArtistsController)
    expect(service).toBeInstanceOf(ArtistsService)
  })
})
