---
'@bitrate/api': minor
---

Added `sort`/`order` query parameters to the six paginated operator-facing list endpoints
(`/admin/artists`, `/admin/audit`, `/admin/moderation/reports`, `/admin/tracks`,
`/admin/users`, `/admin/staff`), each backed by an explicit per-resource field allowlist
that rejects any other value with a 400. Omitting `sort` keeps each endpoint's existing
ordering unchanged, including the track pipeline's attention-first (failed/stuck-first)
default — choosing a `sort` on that endpoint replaces it with a plain ordering instead.
