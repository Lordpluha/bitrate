---
'@bitrate/docs': minor
---

The Kottster admin panel is gone — the app, its agent and rule file, the `kottster` skill, two CI
workflows and its slot in four more, the service in both compose stacks, the nginx upstream and
`/admin` route, and five required environment variables. ADR-0025 records why: it published its
own credentials in a public repository, it wrote to PostgreSQL directly so no API guard,
validation rule, or queue job applied to anything done through it, and it was one page over a
Prisma-managed join table.

Operator tasks have no interface now. That is a gap, not a solved problem — a replacement should
go through the API rather than around it. The published Kottster API token still needs revoking in
its dashboard; deleting the code does not un-publish it.
