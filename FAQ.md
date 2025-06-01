# ❓ FAQ

## Where is the backend?

- Located in `apps/api/` — built on NestJS

## How do I validate environment variables?

- Each app has `.env` file and a corresponding schema in `packages/config/.env.schema.ts`
- Validation is done using Zod

## Where are the shared API contracts?

- In `packages/contracts/`
- Used by both backend and frontend
- Code-generated from Zod + Swagger

## How do I run the project?

```bash
pnpm install
pnpm dev
```

## How do I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md)
