---
'@bitrate/api': minor
---

Added English/Ukrainian internationalisation to the API: error and validation responses are
now translated by the global exception filter based on `Accept-Language` (falling back to
English for an unsupported language), and transactional password-reset/email-verification
mail renders in the recipient's own stored `locale` rather than the request that triggered
it. `User` and `Artist` gained a `locale` column (default `en`), set at registration from
`Accept-Language`. A CI check now fails the build on any drift between the `en`/`uk`
dictionaries, or a translation key referenced in source but defined in neither.
