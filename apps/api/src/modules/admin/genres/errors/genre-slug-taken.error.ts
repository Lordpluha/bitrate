import { ConflictException } from '@nestjs/common'

/** Thrown when a create or update would give a genre a slug another genre already owns. */
export class GenreSlugTakenException extends ConflictException {
  constructor(slug: string) {
    super(`Genre slug "${slug}" is already in use`)
  }
}
