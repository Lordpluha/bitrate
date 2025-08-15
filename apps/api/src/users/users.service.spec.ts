import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserEntity } from './entities'

describe('UsersService', () => {
  let service: UsersService

  const mockUser: UserEntity = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword123',
    avatar: null,
    description: 'Test user description',
    createdAt: new Date('2023-01-01')
  }

  const mockUserWithoutSensitiveData = {
    id: '1',
    username: 'testuser',
    avatar: null,
    description: 'Test user description',
    createdAt: new Date('2023-01-01')
  }

  const mockUserWithoutPassword = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    avatar: null,
    description: 'Test user description',
    createdAt: new Date('2023-01-01')
  }

  const mockPrismaService = {
    user: {
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    service = module.get<UsersService>(UsersService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findById_UNSECURE', () => {
    it('should return user with all fields including sensitive data', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser)

      const result = await service.findById_UNSECURE('1')

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' }
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw error when user not found', async () => {
      const error = new Error('User not found')
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(error)

      await expect(service.findById_UNSECURE('999')).rejects.toThrow(error)

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '999' }
      })
    })
  })

  describe('findById', () => {
    it('should return user without password and email', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(
        mockUserWithoutSensitiveData
      )

      const result = await service.findById('1')

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(mockUserWithoutSensitiveData)
      expect(result).not.toHaveProperty('password')
      expect(result).not.toHaveProperty('email')
    })

    it('should throw error when user not found', async () => {
      const error = new Error('User not found')
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(error)

      await expect(service.findById('999')).rejects.toThrow(error)

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '999' },
        omit: {
          password: true,
          email: true
        }
      })
    })
  })

  describe('getByEmail', () => {
    it('should return user by email without password', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(
        mockUserWithoutPassword
      )

      const result = await service.getByEmail('test@example.com')

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        omit: { password: true }
      })
      expect(result).toEqual(mockUserWithoutPassword)
      expect(result).not.toHaveProperty('password')
    })

    it('should return null when user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null)

      const result = await service.getByEmail('nonexistent@example.com')

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        omit: { password: true }
      })
      expect(result).toBeNull()
    })
  })

  describe('getByEmail_UNSECURE', () => {
    it('should return user by email with all fields including password', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser)

      const result = await service.getByEmail_UNSECURE('test@example.com')

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(result).toEqual(mockUser)
      expect(result).toHaveProperty('password')
    })

    it('should return null when user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null)

      const result = await service.getByEmail_UNSECURE(
        'nonexistent@example.com'
      )

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' }
      })
      expect(result).toBeNull()
    })
  })

  describe('getByUsername', () => {
    it('should return user by username without password and email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(
        mockUserWithoutSensitiveData
      )

      const result = await service.getByUsername('testuser')

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(mockUserWithoutSensitiveData)
      expect(result).not.toHaveProperty('password')
      expect(result).not.toHaveProperty('email')
    })

    it('should return null when user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null)

      const result = await service.getByUsername('nonexistent')

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    const mockUsers = [
      mockUserWithoutSensitiveData,
      {
        ...mockUserWithoutSensitiveData,
        id: '2',
        username: 'testuser2'
      }
    ]

    it('should return paginated users with default pagination', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

      const result = await service.findAll({ username: 'test' })

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { username: 'test' },
        skip: 0,
        take: 10,
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual(mockUsers)
    })

    it('should return paginated users with custom pagination', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        mockUserWithoutSensitiveData
      ])

      const result = await service.findAll({
        username: 'test',
        limit: 5,
        page: 2
      })

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { username: 'test' },
        skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
        take: 5,
        omit: {
          password: true,
          email: true
        }
      })
      expect(result).toEqual([mockUserWithoutSensitiveData])
    })

    it('should handle page = 1 correctly', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers)

      await service.findAll({
        username: 'test',
        limit: 5,
        page: 1
      })

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { username: 'test' },
        skip: 0, // (page - 1) * limit = (1 - 1) * 5 = 0
        take: 5,
        omit: {
          password: true,
          email: true
        }
      })
    })
  })

  describe('create', () => {
    const newUserData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'hashedpassword',
      avatar: null,
      description: null
    }

    it('should create new user and return user without password', async () => {
      const createdUser = {
        id: '2',
        username: 'newuser',
        email: 'new@example.com',
        avatar: null,
        description: null,
        createdAt: new Date()
      }
      mockPrismaService.user.create.mockResolvedValue(createdUser)

      const result = await service.create(newUserData)

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: newUserData,
        omit: { password: true }
      })
      expect(result).toEqual(createdUser)
      expect(result).not.toHaveProperty('password')
    })

    it('should handle creation errors', async () => {
      const error = new Error('User creation failed')
      mockPrismaService.user.create.mockRejectedValue(error)

      await expect(service.create(newUserData)).rejects.toThrow(error)

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: newUserData,
        omit: { password: true }
      })
    })
  })

  describe('updateById', () => {
    const updateData = {
      username: 'updateduser',
      description: 'Updated description'
    }

    it('should update user and return updated user without password', async () => {
      const updatedUser = {
        ...mockUserWithoutPassword,
        username: 'updateduser',
        description: 'Updated description'
      }
      mockPrismaService.user.update.mockResolvedValue(updatedUser)

      const result = await service.updateById('1', updateData)

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        omit: { password: true }
      })
      expect(result).toEqual(updatedUser)
      expect(result).not.toHaveProperty('password')
    })

    it('should handle update errors', async () => {
      const error = new Error('User update failed')
      mockPrismaService.user.update.mockRejectedValue(error)

      await expect(service.updateById('999', updateData)).rejects.toThrow(error)

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '999' },
        data: updateData,
        omit: { password: true }
      })
    })
  })

  describe('uploadAvatar', () => {
    it('should update user avatar and return user without password', async () => {
      const filename = 'avatar.jpg'
      const expectedAvatarPath = '/uploads/users/avatars/avatar.jpg'
      const updatedUser = {
        ...mockUserWithoutPassword,
        avatar: expectedAvatarPath
      }
      mockPrismaService.user.update.mockResolvedValue(updatedUser)

      const result = await service.uploadAvatar('1', filename)

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { avatar: expectedAvatarPath },
        omit: { password: true }
      })
      expect(result).toEqual(updatedUser)
      expect(result.avatar).toBe(expectedAvatarPath)
      expect(result).not.toHaveProperty('password')
    })

    it('should handle avatar upload errors', async () => {
      const error = new Error('Avatar upload failed')
      mockPrismaService.user.update.mockRejectedValue(error)

      await expect(service.uploadAvatar('999', 'avatar.jpg')).rejects.toThrow(
        error
      )

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '999' },
        data: { avatar: '/uploads/users/avatars/avatar.jpg' },
        omit: { password: true }
      })
    })
  })
})
