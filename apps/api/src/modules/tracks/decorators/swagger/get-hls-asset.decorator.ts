import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Proxies one HLS asset — a variant playlist or a media segment — from storage. */
export function GetHlsAssetSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get one HLS asset for a track rendition',
      description:
        'Segments are served with an immutable cache header; the variant `.m3u8` playlist is not.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiParam({ name: 'bitrate', type: 'integer', example: 192, description: 'Rendition kbps' }),
    ApiParam({ name: 'asset', type: 'string', description: 'Playlist or segment filename' }),
    ApiResponse({ status: HttpStatus.OK, description: 'The requested asset bytes' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Track, rendition, or asset not found, or the track is not ready',
    }),
  )
}
