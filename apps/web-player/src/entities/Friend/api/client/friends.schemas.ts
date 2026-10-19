import { z } from 'zod'

/** The public profile the API returns for a friend or a requester. */
const friendUserSchema = z.object({
  avatar: z.string().nullable(),
  id: z.string(),
  username: z.string(),
})

const friendTrackSchema = z.object({
  artist: z.object({ id: z.string(), username: z.string() }),
  cover: z.string().nullable(),
  id: z.string(),
  title: z.string(),
})

const friendPresenceSchema = z.object({
  lastActiveAt: z.coerce.date().nullable(),
  nowPlaying: friendTrackSchema.nullable(),
  status: z.enum(['online', 'away', 'offline']),
})

/** `GET /me/friends`: listening first, then online, away, offline. */
export const friendsSchema = z.array(
  z.object({
    friendsSince: z.coerce.date(),
    presence: friendPresenceSchema,
    user: friendUserSchema,
  }),
)

/** `GET /me/friend-requests`: `user` is the sender (incoming) or the receiver (outgoing). */
export const friendRequestsSchema = z.array(
  z.object({
    createdAt: z.coerce.date(),
    id: z.string(),
    user: friendUserSchema,
  }),
)

/** `POST /users/{id}/friend-request`: `accepted` when they had already asked. */
export const sendFriendRequestSchema = z.object({
  status: z.enum(['pending', 'accepted']),
})

export type Friend = z.infer<typeof friendsSchema>[number]
export type FriendPresence = z.infer<typeof friendPresenceSchema>
export type FriendRequest = z.infer<typeof friendRequestsSchema>[number]
