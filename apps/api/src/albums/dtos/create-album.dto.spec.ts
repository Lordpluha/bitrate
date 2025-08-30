import { z } from 'zod'

import { CreateAlbumDto, CreateAlbumSchema } from './create-album.dto'

describe('CreateAlbumDto', () => {
  describe('CreateAlbumSchema validation', () => {
    it('should validate a valid album creation data', () => {
      const validData = {
        title: 'Test Album',
        description: 'Test album description'
      }

      const result = CreateAlbumSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate album creation data with only required fields', () => {
      const validData = {
        title: 'Test Album'
      }

      const result = CreateAlbumSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should throw error for missing title', () => {
      const invalidData = {
        description: 'Test album description'
      }

      expect(() => CreateAlbumSchema.parse(invalidData)).toThrow()
    })

    it('should allow empty title since schema allows it', () => {
      const validData = {
        title: '',
        description: 'Test album description'
      }

      const result = CreateAlbumSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should throw error for non-string title', () => {
      const invalidData = {
        title: 123,
        description: 'Test album description'
      }

      expect(() => CreateAlbumSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for non-string description', () => {
      const invalidData = {
        title: 'Test Album',
        description: 123
      }

      expect(() => CreateAlbumSchema.parse(invalidData)).toThrow()
    })

    it('should allow undefined description', () => {
      const validData = {
        title: 'Test Album',
        description: undefined
      }

      const result = CreateAlbumSchema.parse(validData)
      expect(result).toEqual({ title: 'Test Album' })
    })
  })

  describe('CreateAlbumDto class', () => {
    it('should create instance with valid data', () => {
      const dto = new CreateAlbumDto()
      dto.title = 'Test Album'
      dto.description = 'Test description'

      expect(dto.title).toBe('Test Album')
      expect(dto.description).toBe('Test description')
    })

    it('should implement CreateAlbumSchema interface', () => {
      const dto: CreateAlbumDto = {
        title: 'Test Album',
        description: 'Test description'
      }

      // Should be assignable to schema type
      const schemaType: z.infer<typeof CreateAlbumSchema> = dto
      expect(schemaType).toEqual(dto)
    })
  })
})
