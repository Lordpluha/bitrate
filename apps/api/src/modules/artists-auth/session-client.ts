import type { Request } from 'express'

/** Longest user agent kept; real browsers stay far below it, so only junk is cut. */
const USER_AGENT_MAX_LENGTH = 512

/** What a sign-in records about the device, so the artist can recognise the session later. */
export type SessionClient = {
  userAgent?: string
}

export function sessionClient(request: Request): SessionClient {
  const userAgent = request.headers?.['user-agent']?.trim()
  return userAgent ? { userAgent: userAgent.slice(0, USER_AGENT_MAX_LENGTH) } : {}
}

/** Fields written whenever a session signs in or refreshes. */
export function sessionActivity(client: SessionClient = {}) {
  return {
    lastUsedAt: new Date(),
    ...(client.userAgent ? { userAgent: client.userAgent } : {}),
  }
}
