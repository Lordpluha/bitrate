---
'@bitrate/web-player': minor
'@bitrate/web-artists': minor
---

Added the support assistant chat to every page of the listener app and the artist portal, behind `NEXT_PUBLIC_SUPPORT_CHAT_ENABLED` / `VITE_SUPPORT_CHAT_ENABLED`, which default to off. The chat restores the saved conversation when it is opened, streams each answer with its sources, and shows when an operator has taken over, when the limit is reached, or when the connection fails. The texts are in English, Ukrainian and Polish.
