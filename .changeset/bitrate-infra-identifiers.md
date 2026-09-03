---
'@bitrate/api': major
'@bitrate/desktop': major
'@bitrate/web-artists': patch
'@bitrate/web-player': patch
---

Infrastructure identifiers moved off the Spotify name. The Postgres databases are now
`bitrate`, `bitrate_shadow`, `bitrate_test`, and `bitrate_test_shadow`; the Docker network is
`bitrate-network`; every container and container-image OS user is `bitrate-*`; the mail sender
is `no-reply@bitrate.local`; and the admin panel's Knex data source lives in
`bitrate_postgres_local`. The Postgres role and password the performance workflows spin up in
CI are now `bitrate` / `bitrate_password`.

Two identifiers break existing consumers. The Prometheus metrics `spotify_api_http_requests_total`
and `spotify_api_http_request_duration_ms_sum` are now `bitrate_api_http_*`, so dashboards and
alerts querying the old names stop returning data. The Redis rate-limit key prefix changed from
`spotify:throttle:` to `bitrate:throttle:`, so counters in flight at deploy time reset and every
client starts from a clean budget once.

The Tauri desktop app renamed its Rust crate (`spotify-desktop` to `bitrate-desktop`, library
`bitrate_desktop_lib`), its bundle identifier (`com.lordpluha.bitrate-desktop`), and its product
name, which is now `Bitrate` rather than a hyphenated slug — so the produced bundle filenames
change. Its dev-only VNC password is `bitrate`.

Existing databases are not migrated. A running environment needs its volume recreated and the
migrations and seed re-run.
