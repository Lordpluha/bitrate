import { Test, TestingModule } from '@nestjs/testing'
import { Readable } from 'stream'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserEntity } from './entities'
import { UpdateUserDto } from './dtos'
import { PrismaService } from '../prisma/prisma.service'
import { TokenService } from '../auth/token.service'

interface RequestWithUser extends Request {
  user?: UserEntity
  [key: string]: unknown
}

describe('UsersController', () => {
  let controller: UsersController

  const mockUser: UserEntity = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    avatar: null,
    description: 'Test user description',
    createdAt: new Date()
  }

  const mockUserWithoutSensitiveData = {
    id: '1',
    username: 'testuser',
    avatar: null,
    description: 'Test user description',
    createdAt: new Date()
  }

  const mockUsersService = {
    findAll: jest.fn(),
    getByUsername: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    uploadAvatar: jest.fn()
  }

  const mockPrismaService = {
    user: {
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn()
    },
    session: {
      findFirst: jest.fn()
    }
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  }

  const mockTokenService = {
    verifyToken: jest.fn()
  }

  const mockReflector = {
    getAllAndOverride: jest.fn()
  }

  const createMockRequest = (user: UserEntity): RequestWithUser => {
    const req = {} as RequestWithUser
    req.user = user
    return req
  }

  const createMockFile = (
    filename: string = 'test.jpg'
  ): Express.Multer.File => ({
    fieldname: 'avatar',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake image data'),
    size: 1024,
    destination: './uploads/users/avatars',
    filename,
    path: `./uploads/users/avatars/${filename}`,
    stream: new Readable()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
        {
          provide: TokenService,
          useValue: mockTokenService
        },
        {
          provide: Reflector,
          useValue: mockReflector
        }
      ]
    }).compile()

    controller = module.get<UsersController>(UsersController)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAll', () => {
    it('should return users list with default pagination', async () => {
      const mockUsers = [mockUserWithoutSensitiveData]
      mockUsersService.findAll.mockResolvedValue(mockUsers)

      const result = await controller.getAll(undefined, undefined, 'test')

      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        username: 'test',
        page: undefined,
        limit: undefined
      })
      expect(result).toEqual(mockUsers)
    })

    it('should return users list with custom pagination', async () => {
      const mockUsers = [mockUserWithoutSensitiveData]
      mockUsersService.findAll.mockResolvedValue(mockUsers)

      const result = await controller.getAll(5, 2, 'test')

      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        username: 'test',
        page: 2,
        limit: 5
      })
      expect(result).toEqual(mockUsers)
    })

    it('should reject when username is not provided', async () => {
      await expect(
        controller.getAll(undefined, undefined, undefined)
      ).rejects.toThrow('User not found')

      expect(mockUsersService.findAll).not.toHaveBeenCalled()
    })
  })

  describe('getByUsername', () => {
    it('should return user by username', async () => {
      mockUsersService.getByUsername.mockResolvedValue(
        mockUserWithoutSensitiveData
      )

      const result = await controller.getByUsername('testuser')

      expect(mockUsersService.getByUsername).toHaveBeenCalledWith('testuser')
      expect(result).toEqual(mockUserWithoutSensitiveData)
    })

    it('should return null when user not found', async () => {
      mockUsersService.getByUsername.mockResolvedValue(null)

      const result = await controller.getByUsername('nonexistent')

      expect(mockUsersService.getByUsername).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('getById', () => {
    it('should return user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUserWithoutSensitiveData)

      const result = await controller.getById('1')

      expect(mockUsersService.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockUserWithoutSensitiveData)
    })

    it('should handle errors when user not found', async () => {
      const error = new Error('User not found')
      mockUsersService.findById.mockRejectedValue(error)

      await expect(controller.getById('999')).rejects.toThrow(error)

      expect(mockUsersService.findById).toHaveBeenCalledWith('999')
    })
  })

  describe('putById', () => {
    const updateUserDto: UpdateUserDto = {
      username: 'updateduser',
      email: 'updated@example.com',
      description: 'Updated description'
    }

    it('should update user successfully', async () => {
      const mockRequest = createMockRequest(mockUser)
      const updatedUser = {
        ...mockUserWithoutSensitiveData,
        username: 'updateduser',
        description: 'Updated description'
      }
      mockUsersService.updateById.mockResolvedValue(updatedUser)

      const result = await controller.putById(
        mockRequest as Request,
        updateUserDto
      )

      expect(mockUsersService.updateById).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto
      )
      expect(result).toEqual(updatedUser)
    })

    it('should handle update errors', async () => {
      const mockRequest = createMockRequest(mockUser)
      const error = new Error('Update failed')
      mockUsersService.updateById.mockRejectedValue(error)

      await expect(
        controller.putById(mockRequest as Request, updateUserDto)
      ).rejects.toThrow(error)

      expect(mockUsersService.updateById).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto
      )
    })
  })

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockRequest = createMockRequest(mockUser)
      const mockFile = createMockFile('1234567890.jpg')
      const updatedUser = {
        ...mockUserWithoutSensitiveData,
        avatar: '/uploads/users/avatars/1234567890.jpg'
      }
      mockUsersService.uploadAvatar.mockResolvedValue(updatedUser)

      const result = await controller.uploadAvatar(
        mockRequest as Request,
        mockFile
      )

      expect(mockUsersService.uploadAvatar).toHaveBeenCalledWith(
        mockUser.id,
        '1234567890.jpg'
      )
      expect(result).toEqual(updatedUser)
    })

    it('should handle upload errors', async () => {
      const mockRequest = createMockRequest(mockUser)
      const mockFile = createMockFile('test.jpg')
      const error = new Error('Upload failed')
      mockUsersService.uploadAvatar.mockRejectedValue(error)

      await expect(
        controller.uploadAvatar(mockRequest as Request, mockFile)
      ).rejects.toThrow(error)

      expect(mockUsersService.uploadAvatar).toHaveBeenCalledWith(
        mockUser.id,
        'test.jpg'
      )
    })
  })
})
