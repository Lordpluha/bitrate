import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

/** Swagger for `DELETE /artists/me`: the signed-in artist deletes their own account. */
export function DeleteArtistSwagger() {
  return applyDecorators(ApiOperation({ summary: "Delete the signed-in artist's account" }))
}
