import { describe, expect, it } from 'vitest'
import { artistAlbumDto, artistTrackDto } from './artist-publications.dto'
import { toArtistAlbum, toArtistTrack } from './artist-publications.mapper'

const RAW_TRACK = {
  id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
  title: 'Test Track',
  cover: 'cover.jpg',
  processingStatus: 'READY',
  playCount: 12,
  deletedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
}

describe('artistTrackDto + toArtistTrack', () => {
  it('parses a realistic track and joins its cover into an absolute URL', () => {
    const dto = artistTrackDto.parse(RAW_TRACK)
    const track = toArtistTrack(dto)

    expect(track.coverUrl).toContain('/static/tracks/covers/cover.jpg')
    expect(track.processingStatus).toBe('READY')
    expect(track.takenDownAt).toBeNull()
  })

  it('accepts a track sent without a cover field, and maps it to a null URL', () => {
    const { cover: _cover, ...withoutCover } = RAW_TRACK
    const dto = artistTrackDto.parse(withoutCover)

    expect(toArtistTrack(dto).coverUrl).toBeNull()
  })

  it('maps a taken-down track through its deletedAt timestamp', () => {
    const dto = artistTrackDto.parse({ ...RAW_TRACK, deletedAt: '2026-09-05T00:00:00.000Z' })

    expect(toArtistTrack(dto).takenDownAt).toEqual(new Date('2026-09-05T00:00:00.000Z'))
  })

  it('throws on a processing status outside the closed union', () => {
    expect(() => artistTrackDto.parse({ ...RAW_TRACK, processingStatus: 'UNKNOWN' })).toThrow()
  })
})

const RAW_ALBUM = {
  id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
  title: 'Test Album',
  cover: null,
  type: 'ALBUM',
  totalTracks: 8,
  releaseDate: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
}

describe('artistAlbumDto + toArtistAlbum', () => {
  it('parses a realistic album into the domain shape', () => {
    const dto = artistAlbumDto.parse(RAW_ALBUM)
    const album = toArtistAlbum(dto)

    expect(album.coverUrl).toBeNull()
    expect(album.type).toBe('ALBUM')
    expect(album.releaseDate).toEqual(new Date(RAW_ALBUM.releaseDate))
  })

  it('maps a missing release date to null rather than an Invalid Date', () => {
    const dto = artistAlbumDto.parse({ ...RAW_ALBUM, releaseDate: null })

    expect(toArtistAlbum(dto).releaseDate).toBeNull()
  })

  it('throws on an album type outside the closed union', () => {
    expect(() => artistAlbumDto.parse({ ...RAW_ALBUM, type: 'BOOTLEG' })).toThrow()
  })
})
