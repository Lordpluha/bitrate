---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/admin': minor
---

Added the support inbox for operators. The admin API lists the conversations the assistant handed to a person (filtered by ticket status, channel and audience), opens one with its history, sends an operator reply and resolves the ticket, under the new `support:read` and `support:reply` permissions (also in the moderator template). The admin panel has a Support section with the inbox and a conversation page, in English and Ukrainian, with loading, empty, error and not-found states; operators without `support:reply` see the conversation read-only.
