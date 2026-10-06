import { ConflictException } from '@nestjs/common'

/**
 * Thrown when an unhide targets a private playlist with no operator hide on record. Its owner
 * chose privacy, so an operator must not publish it.
 */
export class PlaylistNotHiddenByOperatorException extends ConflictException {
  constructor(id: string) {
    super(`Playlist ${id} was not hidden by an operator — only its owner can make it public`)
  }
}
