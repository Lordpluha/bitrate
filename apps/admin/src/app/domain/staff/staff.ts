/** See `TrackProcessingStatus` for why this union is declared here and not imported. */
export type StaffRole = 'ADMIN' | 'MODERATOR'

/** The signed-in operator. */
export type Staff = {
  id: string
  email: string
  username: string
  role: StaffRole
}

/** What an operator types to start a session. */
export type Credentials = {
  email: string
  password: string
}
