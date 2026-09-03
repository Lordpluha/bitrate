/**
 * Identity of the published API document.
 *
 * These were read from `npm_package_name`/`npm_package_version`, which npm only sets when a
 * script runs through it. The production image starts `node` directly, so the live document
 * described itself as "API Documentation" with the literal description
 * "undefined Swagger documentation".
 */
export const API_DOC_TITLE = 'Bitrate API'

export const API_DOC_DESCRIPTION =
  'HTTP API for the Bitrate music platform — catalogue, streaming, playlists, and artist tooling.'

export const API_DOC_VERSION = '1.0'
