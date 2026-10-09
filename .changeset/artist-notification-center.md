---
'@bitrate/api': minor
'@bitrate/contracts': minor
'@bitrate/web-artists': minor
---

Add the artist notification center. The bell opens notifications split into Action
required (overdue tasks, tasks due within two days, changes requested by the reviewer,
failed store deliveries) and Updates (submitted, approved, released, live on a store), each
linking to its release, with relative times and unread marking; a dot on the bell shows
unread items and Mark all as read clears them. Notifications are derived from saved tasks,
review and delivery states, so they never disagree with them; only the last-seen time is
stored, in its own table.
