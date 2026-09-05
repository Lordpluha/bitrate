---
'@bitrate/web-artists': major
---

The artists portal moved from `/artists` on the main domain to its own host. Neither Next.js app
sets `basePath`, so both request their build output from `/_next/…` — under path routing the
portal's assets were resolved against the web player, which does not have them, and the portal
loaded without any of its JavaScript.

Its routes live in their own nginx snippet with build output outside the page rate limit, and
`ARTIST_WEB_HOST` must point at the new host so the API accepts it as a CORS origin.
