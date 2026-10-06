---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
'@bitrate/ui-react': minor
---

**Breaking (released as minor while the product is on 0.x):** clients that register users or artists, or upload tracks and albums, must now send the acceptance fields and `rightsConfirmed: true`.

Registration now requires accepting the legal documents. The API rejects user and artist registration (and the creation of new accounts through Google or Facebook sign-in) unless the Terms of Use, Community Guidelines and Privacy Policy, and for artists the Artist Agreement, are accepted, and it stores the accepted revision and time on the account. The web player and artist apps show the matching required checkboxes and a notice next to the social sign-in buttons, and publish the draft legal documents under /legal/<document>; ui-react gains a Checkbox component.

Uploading a track or creating an album now requires `rightsConfirmed: true` and stores the Artist Agreement revision and time on the track or album; replacing a track's audio requires it too. `GET /auth/me` reports `legalAcceptanceRequired`, and `POST /auth/legal/accept` records the current revision, which the web player's blocking dialog uses for accounts that never accepted or accepted an older revision. The legal pages now include a Complaints and reports page, and the registration checkboxes link the Terms of Use, Community Guidelines and Privacy Policy in a new tab.
