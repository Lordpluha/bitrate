import type { Permission } from '@domain/access'

/** The signed-in operator. */
export type Staff = {
  id: string
  email: string
  username: string
  /** The role's id — provenance/display only, grants nothing by itself. */
  roleId: string
  /** The role's name. Free text now that roles are custom; `'ADMIN'` is the one reserved name. */
  roleName: string
  /** The permissions actually held by this operator. */
  permissions: Permission[]
}

/** What an operator types to start a session. */
export type Credentials = {
  email: string
  password: string
}
