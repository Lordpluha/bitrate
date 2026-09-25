---
'@bitrate/api': minor
---

Added the operator-facing role-template and staff-management API: `/admin/roles` (list/get with
per-role active-operator `holders` and `divergentHolders` counts, `/admin/roles/permissions` for
the full permission catalogue with a `heldBy` count per permission, create/edit/delete of
non-`ADMIN` role templates) and `/admin/staff` (list/get, create an operator, reassign its role,
replace its own permission set, and deactivate it — deactivation also revokes every session for
that operator in the same transaction). Assigning a role copies its current template onto the
operator; editing a template afterwards does not reach operators already assigned it. The
built-in `ADMIN` role can never be edited or deleted and its own `permissions` are always `[]`;
the built-in `MODERATOR` template may be edited but not renamed. An operation that would leave
zero active operators holding the built-in `ADMIN` role is rejected. Every permission change
(creation, role reassignment, or a direct permission edit) writes its own detailed audit row —
before/after/added/removed — inside the same transaction as the write, alongside the generic row
the global audit interceptor already records for every mutating request.
