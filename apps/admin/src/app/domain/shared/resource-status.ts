/**
 * Whether a soft-deletable resource's list/detail view includes deactivated rows. Shared by
 * every resource that carries a `deletedAt` column and a restore route — users and artists
 * today, more to follow the same convention. Its three members are stated directly in
 * `resourceStatusParam` rather than through `coveringTuple`, because that codec is itself the
 * one place bound to this union.
 */
export type ResourceStatus = 'active' | 'deactivated' | 'all'
