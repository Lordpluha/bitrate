import { applyDecorators } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export function GetAlbumsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all albums with pagination and filters' })
  )
}
