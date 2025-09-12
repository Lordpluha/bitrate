import { z } from 'zod'

import { CreateArtistDto, CreateArtistSchema } from './create-artist.dto'

describe('CreateArtistDto', () => {
  describe('CreateArtistSchema validation', () => {
    it('should validate a valid artist creation data', () => {
      const validData = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'testartist'
      }

      const result = CreateArtistSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should throw error for invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        username: 'testartist'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for missing email', () => {
      const invalidData = {
        password: 'password123',
        username: 'testartist'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for password shorter than 6 characters', () => {
      const invalidData = {
        email: 'artist@example.com',
        password: '12345',
        username: 'testartist'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for password longer than 32 characters', () => {
      const invalidData = {
        email: 'artist@example.com',
        password: 'a'.repeat(33),
        username: 'testartist'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for username shorter than 3 characters', () => {
      const invalidData = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'ab'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for missing username', () => {
      const invalidData = {
        email: 'artist@example.com',
        password: 'password123'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for missing password', () => {
      const invalidData = {
        email: 'artist@example.com',
        username: 'testartist'
      }

      expect(() => CreateArtistSchema.parse(invalidData)).toThrow()
    })

    it('should accept valid password of 6 characters', () => {
      const validData = {
        email: 'artist@example.com',
        password: '123456',
        username: 'testartist'
      }

      const result = CreateArtistSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should accept valid password of 32 characters', () => {
      const validData = {
        email: 'artist@example.com',
        password: 'a'.repeat(32),
        username: 'testartist'
      }

      const result = CreateArtistSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should accept valid username of 3 characters', () => {
      const validData = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'abc'
      }

      const result = CreateArtistSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate with additional unknown properties removed', () => {
      const dataWithExtra = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'testartist',
        extraField: 'should be ignored'
      }

      const result = CreateArtistSchema.parse(dataWithExtra)
      expect(result).toEqual({
        email: 'artist@example.com',
        password: 'password123',
        username: 'testartist'
      })
      expect(result).not.toHaveProperty('extraField')
    })
  })

  describe('CreateArtistDto class', () => {
    it('should create instance with valid data', () => {
      const dto = new CreateArtistDto()
      dto.email = 'artist@example.com'
      dto.password = 'password123'
      dto.username = 'testartist'

      expect(dto.email).toBe('artist@example.com')
      expect(dto.password).toBe('password123')
      expect(dto.username).toBe('testartist')
    })

    it('should implement CreateArtistSchema interface', () => {
      const dto: CreateArtistDto = {
        email: 'artist@example.com',
        password: 'password123',
        username: 'testartist'
      }

      // Should be assignable to schema type
      const schemaType: z.infer<typeof CreateArtistSchema> = dto
      expect(schemaType).toEqual(dto)
    })
  })
})
