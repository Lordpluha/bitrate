---
'@bitrate/admin': minor
'@bitrate/contracts': minor
---

The operator panel now reads the regenerated `StaffEntity` contract (`roleId`, free-text `role`, and a `permissions` array) instead of the old `'ADMIN' | 'MODERATOR'` role union, and hides navigation and mutating controls the signed-in operator's permissions do not cover. Routes are gated per screen (`reports:read`, `tracks:read`, `artists:read`, `users:read`, `audit:read`); an operator denied one screen is redirected to the first they can reach, or to a new no-access page if none. Hiding is cosmetic — the API remains the sole enforcement point.
