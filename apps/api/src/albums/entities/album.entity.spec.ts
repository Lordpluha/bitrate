import { AlbumEntity } from './album.entity'
import { Album } from '@prisma/client'

describe('AlbumEntity', () => {
  it('should create a valid album entity', () => {
    const albumData: Album = {
      id: '1',
      title: 'Test Album',
      cover: 'album-cover.jpg',
      artistId: 'artist1',
      description: 'Test album description',
      createdAt: new Date('2023-01-01T00:00:00.000Z')
    }

    const album = new AlbumEntity()
    Object.assign(album, albumData)

    expect(album.id).toBe('1')
    expect(album.title).toBe('Test Album')
    expect(album.cover).toBe('album-cover.jpg')
    expect(album.artistId).toBe('artist1')
    expect(album.description).toBe('Test album description')
    expect(album.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'))
  })

  it('should implement Album interface from Prisma', () => {
    const albumEntity: AlbumEntity = {
      id: '1',
      title: 'Test Album',
      cover: 'album-cover.jpg',
      artistId: 'artist1',
      description: 'Test album description',
      createdAt: new Date()
    }

    // Should be assignable to Prisma Album type
    const prismaAlbum: Album = albumEntity
    expect(prismaAlbum).toEqual(albumEntity)
  })

  it('should allow null description', () => {
    const album = new AlbumEntity()
    album.id = '1'
    album.title = 'Test Album'
    album.cover = 'album-cover.jpg'
    album.artistId = 'artist1'
    album.description = null
    album.createdAt = new Date()

    expect(album.description).toBeNull()
  })

  it('should have all required properties', () => {
    const album = new AlbumEntity()

    // Check that all required properties exist
    expect(album).toHaveProperty('id')
    expect(album).toHaveProperty('title')
    expect(album).toHaveProperty('cover')
    expect(album).toHaveProperty('artistId')
    expect(album).toHaveProperty('description')
    expect(album).toHaveProperty('createdAt')
  })

  it('should match Prisma Album interface structure', () => {
    const albumEntity = new AlbumEntity()

    // Expected properties from Prisma Album interface
    const expectedProperties = [
      'id',
      'title',
      'cover',
      'artistId',
      'description',
      'createdAt'
    ]

    expectedProperties.forEach(prop => {
      expect(albumEntity).toHaveProperty(prop)
    })
  })
})
