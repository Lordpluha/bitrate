---
'@bitrate/web-artists': minor
'@bitrate/api': minor
'@bitrate/contracts': minor
---

Add the protected artist dashboard with responsive navigation, verified server sessions,
safe return-to-login redirects, two-factor sign-in and recoverable auth errors. Prepare the
release workspace schema with contributors, recording/composition splits, UPC and territories;
share pending two-factor cookies across the configured API/portal domain.

Complete the artist email-verification flow: explain the verification requirement after
registration and at login, handle confirmation links and allow resending expired links.
Add six-digit artist verification codes with a ten-minute lifetime, atomic attempt limits
and resend cooldowns. Match verification and two-factor forms to the existing auth style
and report unavailable or local mail delivery without claiming an email was sent.

Add artist-owned release draft creation and paginated workspace listing with validated
inputs, session-derived ownership, soft-deletion filtering and private no-store responses.

Connect Create release and Music to the release API: validate the title/type form, prevent
duplicate submissions while saving, show confirmed drafts and paginated summaries, and
handle loading, empty, malformed-response and retry states. Scope release query caches
to the signed-in artist and keep one responsive layout across Light, Dark and Dim.

Add the private database-backed Music catalogue: tracks/releases tabs, combined search
and filters, stable sorting, pagination, read-only details and optional audio previews.
Use the design's original cover/background assets and one layout across all three
themes. Add owner-constrained preparation recordings and an opt-in idempotent demo
seed without inserting public tracks or implementing publication and upload transitions.

Add title/type editing for owned release drafts with a latest-summary read and an
atomic owner/status/version-guarded PATCH. Keep entered values on failed or conflicting
saves, validate responses before confirming success, refresh artist-scoped catalogue
caches and reuse accessible responsive fields across create/edit dialogs.

Add an addressable artist-owned release workspace with active private/existing
recording metadata, optional scheduled date and credited participants. Bound relation
previews with genuine totals, validate private API responses and refresh the workspace
after a draft edit. Reuse the Pencil waveform and responsive desktop/mobile geometry
across all three themes without fabricating review history or delivery results.

Add planned UTC date/time editing and clearing for owned DRAFT workspaces through
the existing version-guarded PATCH. Preserve omitted metadata and entered values
on errors, and validate the saved instant before displaying success. Saving a plan
does not submit review or start external delivery.

Add credited participants to owned release drafts with validated names and unique
roles. Persist each credit and the guarded release version in one transaction;
refresh Music/workspace after confirmed writes and preserve form entries on errors.
Use a shared responsive three-theme dialog with pending dismissal locks.

Allow correcting an existing participant's name and roles with a current single-credit
read and the same transactional draft/version guard. Preserve contributor identity,
artist links and splits; repair legacy credits without roles and keep entries on
conflicts or unconfirmed saves. Share the accessible form with contributor addition.
