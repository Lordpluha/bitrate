import { NotFoundException } from '@nestjs/common'

/** Thrown when a genre id does not resolve to an existing genre. */
export class GenreNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Genre ${id} not found`)
  }
}
