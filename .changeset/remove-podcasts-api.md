---
'@bitrate/api': major
'@bitrate/contracts': major
---

Removed the listener podcast and saved-episode endpoints, the `podcast` and `episode` moderation report subjects and the report subject's `parentId` because Bitrate became music-only (ADR-0066). A migration deletes podcast and episode reports and drops the `Podcast`, `Episode` and `UserSavedEpisode` tables.
