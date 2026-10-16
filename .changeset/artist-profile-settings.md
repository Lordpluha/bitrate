---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-artists': minor
---

Add the artist Profile and Settings pages. Profile edits the public handle, country, bio
and links with a live preview, and uploads or removes the profile photo and header image
through the object store with content checks, instead of client-supplied URLs. Writes carry
the profile version, so two tabs never silently overwrite each other, and a taken handle
reports a clear conflict. Settings shows the sign-in email and its verification, turns
two-factor sign-in on with a QR code or manual key and off with a code, sends a password
reset link, switches appearance, and deletes the account after the handle is typed.
Profile and Settings are now real routes in the workspace navigation, in the designed
order, and the Music upload shortcut explains that tracks are uploaded inside a release.
