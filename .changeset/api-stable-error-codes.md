---
"@bitrate/api": minor
"@bitrate/contracts": minor
---

Error responses gain an additive `code` field: the dictionary key the message was translated from (for example `errors.track.not_found`). A message that is still an untranslated English literal has no `code`. A validation failure answers `code: errors.validation.failed` plus an `errors` array of `{ path, code?, message }`, with each zod issue translated in the request locale (`validation.too_small.string`, `validation.invalid_format.email`, `validation.required`, …); a hand-written DTO message is kept as written and has no per-field `code`. The API now translates into en, uk, ru, pl and de (ru, pl and de are unreviewed machine-written text), falling back to en. Transactional emails keep en/uk: the mail locale comes from the account's stored locale, and any other value falls back to en. New `TranslatableException` base for keyed errors; a Jest scan now fails on any new literal exception or DTO message that is not on the shrinking allowlist in `apps/api/test/i18n-literal-allowlist.json`.
