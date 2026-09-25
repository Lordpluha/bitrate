---
'@bitrate/admin': minor
---

Added the roles screens to the operator panel: a list of role templates with holder/divergence
counts and the permission catalogue, and a create/edit screen with a shared permission grid.
Built-in roles are read-only (`ADMIN`) or rename-locked (`MODERATOR`), a custom role cannot be
deleted while operators still hold it, and API refusals (duplicate name, built-in edit, a role
still in use) surface as specific messages instead of a generic failure.
