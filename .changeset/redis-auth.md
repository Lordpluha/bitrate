---
'@bitrate/api': major
---

The API could not talk to a password-protected Redis. `env.schema.ts` had no `REDIS_PASSWORD`,
and both connection sites — the BullMQ root config and the cache module's ioredis client — passed
only host and port, while the production compose starts Redis with `--requirepass`. Every command
came back `NOAUTH Authentication required`, so rate limiting, caching, and the job queue were all
dead in production.

Redis's health check hid it. `redis-cli --raw incr ping` exits 0 even when the server answers
NOAUTH, so the container reported healthy while nothing could use it — and the probe incremented
a key named `ping` in the live database every few seconds. It now authenticates and asserts on
the reply.
