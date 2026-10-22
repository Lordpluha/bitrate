import { pipeline } from 'node:stream'
import type { Logger } from '@nestjs/common'
import type { Response } from 'express'

/**
 * Streams storage bytes into an HTTP response.
 *
 * Unlike `.pipe`, a source that fails mid-transfer destroys the response instead of leaving it
 * hanging, and a client that goes away releases the source. Headers are already sent by then,
 * so a source failure is only logged; a client disconnect is expected and stays silent.
 */
export function pipeToResponse(
  stream: NodeJS.ReadableStream,
  response: Response,
  logger: Logger,
  label: string,
): void {
  pipeline(stream, response, (error) => {
    if (error && error.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      logger.warn(`${label} stream failed: ${error.message}`)
    }
  })
}
