import { UpdateAlbumDto, UpdateAlbumSchema } from './update-album.dto'
import { z } from 'zod'

describe('UpdateAlbumDto', () => {
  describe('UpdateAlbumSchema validation', () => {
    it('should validate a valid album update data', () => {
      const validData = {
        title: 'Updated Album',
        description: 'Updated album description'
      }

      const result = UpdateAlbumSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate album update data with only title', () => {
      const validData = {
        title: 'Updated Album'
      }

      const result = UpdateAlbumSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should throw error for missing title', () => {
      const invalidData = {
        description: 'Updated album description'
      }

      expect(() => UpdateAlbumSchema.parse(invalidData)).toThrow()
    })

    it('should allow empty title since schema allows it', () => {
      const validData = {
        title: '',
        description: 'Updated album description'
      }

      const result = UpdateAlbumSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should throw error for non-string title', () => {
      const invalidData = {
        title: 123,
        description: 'Updated album description'
      }

      expect(() => UpdateAlbumSchema.parse(invalidData)).toThrow()
    })

    it('should throw error for non-string description', () => {
      const invalidData = {
        title: 'Updated Album',
        description: 123
      }

      expect(() => UpdateAlbumSchema.parse(invalidData)).toThrow()
    })

    it('should allow undefined description', () => {
      const validData = {
        title: 'Updated Album',
        description: undefined
      }

      const result = UpdateAlbumSchema.parse(validData)
      expect(result).toEqual({ title: 'Updated Album' })
    })

    it('should validate with additional unknown properties removed', () => {
      const dataWithExtra = {
        title: 'Updated Album',
        description: 'Updated description',
        extraField: 'should be ignored'
      }

      const result = UpdateAlbumSchema.parse(dataWithExtra)
      expect(result).toEqual({
        title: 'Updated Album',
        description: 'Updated description'
      })
      expect(result).not.toHaveProperty('extraField')
    })
  })

  describe('UpdateAlbumDto class', () => {
    it('should create instance with valid data', () => {
      const dto = new UpdateAlbumDto()
      dto.title = 'Updated Album'
      dto.description = 'Updated description'

      expect(dto.title).toBe('Updated Album')
      expect(dto.description).toBe('Updated description')
    })

    it('should implement UpdateAlbumSchema interface', () => {
      const dto: UpdateAlbumDto = {
        title: 'Updated Album',
        description: 'Updated description'
      }

      // Should be assignable to schema type
      const schemaType: z.infer<typeof UpdateAlbumSchema> = dto
      expect(schemaType).toEqual(dto)
    })
  })
})
