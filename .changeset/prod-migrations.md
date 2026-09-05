---
'@bitrate/api': major
'@bitrate/docs': patch
---

Migrations could not run in production. The API image did not include `prisma.config.ts`, and
`schema.prisma` declares a datasource with no `url` — the URL comes only from that config — so
every Prisma command failed with "The datasource.url property is required". The image now carries
the TypeScript config at the path Prisma looks in — the compiled output is CommonJS, which
Prisma's config loader rejects outright.

`task prod:migrate` and `task prod:seed` were added. The documented `task db:migrate` targets the
preprod stack and runs `prisma migrate dev`, which generates migrations, requires a shadow
database, and can reset the database it is pointed at — not something to aim at production.
