import { NotFoundException, type PipeTransform } from '@nestjs/common'
import { RECOMMENDATION_ERRORS } from '../errors'

/**
 * Maps a URL segment (`tracks`, `playlists`) to the stored entity type. An unknown segment is a
 * route that does not exist, so it answers 404 rather than a validation error.
 */
export class ParseKindPipe<Kinds extends Record<string, string>>
  implements PipeTransform<string, Kinds[keyof Kinds]>
{
  constructor(private readonly kinds: Kinds) {}

  transform(value: string): Kinds[keyof Kinds] {
    if (!Object.hasOwn(this.kinds, value)) {
      throw new NotFoundException(RECOMMENDATION_ERRORS.ENTITY_NOT_FOUND)
    }
    return this.kinds[value as keyof Kinds]
  }
}
