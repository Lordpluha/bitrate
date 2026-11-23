import type { Response } from 'express'

/**
 * Starts a Server-Sent Events response. `X-Accel-Buffering: no` keeps nginx from holding the
 * stream until it ends, which would turn a streamed answer into one late block.
 */
export function openEventStream(res: Response): void {
  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()
}
