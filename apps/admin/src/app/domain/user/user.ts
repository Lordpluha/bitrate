/** A listener account. Named `User` because that is what the API and the database call it. */
export type User = {
  id: string
  username: string
  email: string
  emailVerifiedAt: Date | null
  createdAt: Date
  /** See `Artist.deactivatedAt` — same rule, same reason for the name. */
  deactivatedAt: Date | null
}

export type UserFilter = {
  query?: string
}

export function isUserActive(user: User): boolean {
  return user.deactivatedAt === null
}
