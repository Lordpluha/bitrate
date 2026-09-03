---
'@bitrate/api': major
---

Mail could not be sent from a typical VPS. The transport treated only port 465 as implicit TLS,
so the alternative port hosts leave open when they block the standard ones — 2465 — would have
been negotiated as plaintext and failed. Both are now recognised.

Worth knowing when this bites: providers block outbound 25, 465, and 587 silently, so the
connection times out rather than being refused and a mail failure presents as a hang with nothing
in the logs and nothing in the provider's dashboard.
