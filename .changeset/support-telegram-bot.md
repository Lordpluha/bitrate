---
'@bitrate/api': minor
'@bitrate/support-core': minor
---

Added the support assistant in Telegram. The webhook (`/api/v1/support/telegram/webhook`, off until `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` are set) checks Telegram's secret token, queues each private text message once by its update id and answers at once; the API process runs the same turn as the web chat and sends the answer as Telegram HTML with its sources, split within Telegram's limit. Each chat is one anonymous listener conversation in the user's language, limited to 20 messages a minute with a one-time notice, and `/start` gets a greeting. Operator replies from the support inbox reach Telegram users through the same queue. The support core gains the welcome and rate-limit notices in English, Ukrainian and Polish.
