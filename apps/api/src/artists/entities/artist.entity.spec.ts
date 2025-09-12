import { Artist } from '@prisma/client'

import { ArtistEntity } from './artist.entity'

describe('ArtistEntity', () => {
  it('should create a valid artist entity', () => {
    const artistData: Artist = {
      id: '1',
      username: 'testartist',
      password: 'hashedPassword',
      email: 'artist@example.com',
      bio: 'Test artist biography',
      avatar: 'avatar.jpg',
      backgroundImage: 'background.jpg',
      createdAt: new Date('2023-01-01T00:00:00.000Z')
    }

    const artist = new ArtistEntity()
    Object.assign(artist, artistData)

    expect(artist.id).toBe('1')
    expect(artist.username).toBe('testartist')
    expect(artist.password).toBe('hashedPassword')
    expect(artist.email).toBe('artist@example.com')
    expect(artist.bio).toBe('Test artist biography')
    expect(artist.avatar).toBe('avatar.jpg')
    expect(artist.backgroundImage).toBe('background.jpg')
    expect(artist.createdAt).toEqual(new Date('2023-01-01T00:00:00.000Z'))
  })

  it('should implement Artist interface from Prisma', () => {
    const artistEntity: ArtistEntity = {
      id: '1',
      username: 'testartist',
      password: 'hashedPassword',
      email: 'artist@example.com',
      bio: 'Test artist biography',
      avatar: 'avatar.jpg',
      backgroundImage: 'background.jpg',
      createdAt: new Date()
    }

    // Should be assignable to Prisma Artist type
    const prismaArtist: Artist = artistEntity
    expect(prismaArtist).toEqual(artistEntity)
  })

  it('should allow null values for optional fields', () => {
    const artist = new ArtistEntity()
    artist.id = '1'
    artist.username = 'testartist'
    artist.password = 'hashedPassword'
    artist.email = 'artist@example.com'
    artist.bio = null
    artist.avatar = null
    artist.backgroundImage = null
    artist.createdAt = new Date()

    expect(artist.bio).toBeNull()
    expect(artist.avatar).toBeNull()
    expect(artist.backgroundImage).toBeNull()
  })

  it('should have all required properties', () => {
    const artist = new ArtistEntity()

    // Check that all required properties exist
    expect(artist).toHaveProperty('id')
    expect(artist).toHaveProperty('username')
    expect(artist).toHaveProperty('password')
    expect(artist).toHaveProperty('email')
    expect(artist).toHaveProperty('bio')
    expect(artist).toHaveProperty('avatar')
    expect(artist).toHaveProperty('backgroundImage')
    expect(artist).toHaveProperty('createdAt')
  })

  it('should match Prisma Artist interface structure', () => {
    const artistEntity = new ArtistEntity()

    // Expected properties from Prisma Artist interface
    const expectedProperties = [
      'id',
      'username',
      'password',
      'email',
      'bio',
      'avatar',
      'backgroundImage',
      'createdAt'
    ]

    expectedProperties.forEach(prop => {
      expect(artistEntity).toHaveProperty(prop)
    })
  })

  it('should handle empty strings for optional fields', () => {
    const artist = new ArtistEntity()
    artist.id = '1'
    artist.username = 'testartist'
    artist.password = 'hashedPassword'
    artist.email = 'artist@example.com'
    artist.bio = ''
    artist.avatar = ''
    artist.backgroundImage = ''
    artist.createdAt = new Date()

    expect(typeof artist.bio).toBe('string')
    expect(typeof artist.avatar).toBe('string')
    expect(typeof artist.backgroundImage).toBe('string')
    expect(artist.bio).toBe('')
    expect(artist.avatar).toBe('')
    expect(artist.backgroundImage).toBe('')
  })
})
