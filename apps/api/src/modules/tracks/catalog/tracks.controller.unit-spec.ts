import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { buildTrack } from '../__tests__/fixtures/tracks.fixtures'
import { TracksController } from './tracks.controller'
import type { TracksService } from './tracks.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    findLikedTracks: jest.fn(),
    like: jest.fn(),
    unlike: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

describe('TracksController', () => {
  let controller: TracksController
  let service: jest.Mocked<TracksService>

  beforeEach(() => {
    service = makeServiceMock()
    controller = new TracksController(service)
  })

  it('getAll should delegate to service.findAll', () => {
    const expected = { data: [buildTrack()], meta: { total: 1, page: 1, limit: 10, lastPage: 1 } }
    service.findAll.mockResolvedValue(expected as never)

    const result = controller.getAll(1, 10, undefined)

    expect(service.findAll).toHaveBeenCalledWith({ limit: 10, page: 1, title: undefined })
    expect(result).resolves.toBe(expected)
  })

  it('getById should call service.findTrackById', () => {
    const track = buildTrack()
    service.findTrackById.mockResolvedValue(track as never)

    const result = controller.getById('track-1')

    expect(service.findTrackById).toHaveBeenCalledWith('track-1')
    expect(result).resolves.toBe(track)
  })

  it('getLikedTracks should call service.findLikedTracks with user id from request', () => {
    const tracks = [buildTrack()]
    service.findLikedTracks.mockResolvedValue(tracks as never)
    const user = buildUser({ id: 'user-1' })

    const result = controller.getLikedTracks(user, 1, 10)

    expect(service.findLikedTracks).toHaveBeenCalledWith('user-1', { page: 1, limit: 10 })
    expect(result).resolves.toBe(tracks)
  })

  it('likeTrack should call service.like with user id and track id', () => {
    const track = buildTrack()
    service.like.mockResolvedValue(track as never)
    const user = buildUser({ id: 'user-1' })

    const result = controller.likeTrack(user, 'track-1')

    expect(service.like).toHaveBeenCalledWith('user-1', 'track-1')
    expect(result).resolves.toBe(track)
  })

  it('unlikeTrack should call service.unlike with user id and track id', () => {
    const track = buildTrack()
    service.unlike.mockResolvedValue(track as never)
    const user = buildUser({ id: 'user-1' })

    const result = controller.unlikeTrack(user, 'track-1')

    expect(service.unlike).toHaveBeenCalledWith('user-1', 'track-1')
    expect(result).resolves.toBe(track)
  })
})
