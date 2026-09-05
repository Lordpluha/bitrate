---
'@bitrate/api': minor
---

The published API document identifies itself correctly and no longer advertises a foreign host.

Its title and description were read from `npm_package_name`, which npm sets only for processes it
launches. The production image runs `node` directly, so the live document at `/swagger` called
itself "API Documentation" and described itself as **"undefined Swagger documentation"** — the
literal string. Both come from named constants now, and the Swagger UI page gains a real tab title.

The server list still offered `https://spotify-clone-api-jp5z.onrender.com/` alongside
`http://localhost:3000`, so "Try it out" on the public document pointed at a host that is not ours
and one that is not reachable. The stale entry is gone and the deployed origin is added from
`API_BASE_URL` when it is set.

`setExternalDoc('@bitrate/docs', '')` emitted `externalDocs` with an empty `url`, which OpenAPI
does not allow. It is removed until the documentation site has an address to point at.
