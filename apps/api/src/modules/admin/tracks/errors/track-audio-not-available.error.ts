import { NotFoundException } from '@nestjs/common'
import type { TrackProcessingStatus } from '@prisma/client'

/** Thrown when a track exists but has no playable CMAF rendition at the requested bitrate. */
export class TrackAudioNotAvailableException extends NotFoundException {
  constructor(id: string, processingStatus: TrackProcessingStatus) {
    super(`Track ${id} has no playable audio (processingStatus=${processingStatus})`)
  }
}
