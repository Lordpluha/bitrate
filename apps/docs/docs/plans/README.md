# Implementation plans

Use this directory for approved, non-trivial implementation plans that must survive beyond
one agent/session. `br-planner` (the heavy `--agent` planning specialist, dispatched by
`/br-implement --plan` or invoked directly) produces these; inline planning at the start of
an ordinary `/br-implement` run remains sufficient for small tasks.

File name:

```text
YYYY-MM-DD-<short-kebab-task>.md
```

A plan names concrete files, ordered steps, verification commands, migration constraints,
and explicit out-of-scope work. It is not a substitute for an ADR: plans describe how to
deliver one change; ADRs record durable architecture decisions.

Copy [`template.md`](./template.md).
