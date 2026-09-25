---
'@bitrate/admin': minor
---

Added the staff screens to the operator panel. The directory lists operators with their role and a
badge showing how each one's permissions differ from that role's template, with the page kept in
the URL. Creating an operator starts from the chosen role's permissions and lets an administrator
adjust them before saving. An operator's page edits their own permission set, or states that a
built-in administrator holds every permission and cannot be edited individually; reassigning a role
warns that it replaces the current set. Each refusal from the API — a protected permission, the last
active administrator, an email or username already in use — is shown as a specific sentence.
