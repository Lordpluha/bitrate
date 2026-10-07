---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-artists': minor
---

Add rights confirmation, splits, identifiers and submission to owned release drafts.
Artists record the master owner and confirm that every writer is credited and the
information is accurate; changing credits clears both confirmations and changing splits
clears accuracy. Recording and composition splits may stay partial in a draft but never
exceed 100%, and a release credits at most 50 contributors. An optional UPC (with check
digit, stored as its GTIN-13) and per-recording ISRC are validated and kept unique among
live drafts and catalogue tracks; deleting a draft frees its codes, and a linked catalogue
recording can gain a missing ISRC. Every write advances the release version. The workspace reports submission blockers and non-blocking notices, and a
ready draft can be submitted for Bitrate review (re-checked in the same transaction) or
withdrawn back to its draft. Submission never starts external delivery.

The release workspace shows rights and identifiers, Master/Publishing splits with a live
total, per-recording ISRC and a readiness checklist with blockers and notes. Artists edit
rights, splits, UPC and ISRC in dialogs that keep entries on errors, confirm the review,
submit for Bitrate review and withdraw the request. Changing the master owner and saving
any change ask for the accuracy and review confirmations again.
