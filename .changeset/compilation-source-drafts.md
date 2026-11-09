---
'@bitrate/api': patch
'@bitrate/web-artists': patch
---

Fixed compilation previews and duplicate-audio checks matching the wrong original master after a
recording was removed, signing out of saved accounts on logout, switching away from an account
signed in past the saved-account limit, uploads into an emptied compilation, and uploads failing
on a missing older master. A release whose recordings a compilation draft still uses can no longer
be deleted. Top tracks reset to the first page when the period changes, read their page in one
history scan, and sign-in pages no longer download workspace and landing styles.
