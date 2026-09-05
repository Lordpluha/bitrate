---
'@bitrate/api': patch
---

Migrations run before the new containers start, not after.

`prod:migrate` used `compose exec api`, which needs that container already running — so migrations
could only happen after the restart, and the new code served requests against the old schema for as
long as they took. That is the worse of the two windows: new code is precisely what needs the new
columns. It also made every deploy race the container's boot, which the workflow papered over with
a six-attempt retry loop.

The migration now runs in a throwaway container from the image just pulled, which needs nothing
running but the database, so `prod:deploy` is pull, migrate, restart. The retry loop is gone with
the race that caused it. Old code meeting an already-migrated schema is the safe direction, and it
stays safe as long as migrations are additive — expand in one release, contract in a later one.
