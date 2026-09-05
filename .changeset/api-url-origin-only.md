---
'@bitrate/docs': patch
---

Documents that `NEXT_PUBLIC_API_URL`, `API_BASE_URL`, and `API_URL` hold an origin with no path.
The API sets a global prefix of `api` and both fetch clients build `${base}/api/v1/…`
themselves, so putting the prefix in the variable produces `/api/api/v1/…` and a 404 on every
request — while the app still starts cleanly, which makes it look like a routing problem rather
than a configuration one. Also records that `NEXT_PUBLIC_*` are build-time and need a rebuild,
not a restart.
