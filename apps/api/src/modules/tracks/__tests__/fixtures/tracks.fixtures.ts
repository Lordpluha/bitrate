import type { TrackEntity } from '../../entities'

/** The build track value. */
export const buildTrack = (overrides: Partial<TrackEntity> = {}): TrackEntity => ({
  id: 'track-1',
  title: 'Track title',
  audioUrl: 'audio.mp3',
  cover: 'cover.jpg',
  artistId: 'artist-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  duration: null,
  releaseDate: null,
  lyrics: null,
  processingStatus: 'READY',
  processingError: null,
  processingAttempts: 1,
  processingStartedAt: null,
  processingFinishedAt: new Date(),
  explicit: false,
  popularity: 0,
  playCount: 0,
  isrc: null,
  previewUrl: null,
  trackNumber: null,
  discNumber: 1,
  language: null,
  deletedAt: null,
  ...overrides,
})

/** The build audio file value. */
export const buildAudioFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    fieldname: 'audio',
    originalname: 'track.mp3',
    encoding: '7bit',
    mimetype: 'audio/mpeg',
    size: 1024,
    filename: 'unique-track.mp3',
    destination: './storage/private/tracks',
    path: './storage/private/tracks/unique-track.mp3',
    stream: null as never,
    buffer: Buffer.from(''),
    ...overrides,
  }) as Express.Multer.File
