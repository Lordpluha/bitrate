---
paths:
  - "apps/api/**"
---

# NestJS API requirements

- Follow existing module/service/controller/DTO/entity/decorator organization and aliases.
  Controllers stay thin; injectable services own business logic and are registered in modules.
- Swagger decorators live in decorators/, composed per endpoint. Declare write-route
  ApiBody explicitly. Preserve runtime imports for DI; regenerate/check changed contracts.
- DTOs use nestjs-zod; distinguish runtime validation, wire entities and Prisma models.
- Sort/query parameters use model-bound allowlists; never pass arbitrary keys to Prisma.
- Review generated migrations for unrelated DROPs/data loss before applying them. Preserve
  transactional boundaries, idempotency and existing deletion policy.
- Use established guards, auth/permission checks, domain exceptions and BullMQ patterns.
  Test denied access, invalid input and meaningful failure paths, not just successful calls.
- Secrets remain external. No real env file reads or writes to make checks pass.
- Use scoped Jest suites and workspace scripts. For migrations, Swagger, Prisma, queues,
  aliases or module wiring read `.claude/references/api-rules-guide.md`'s relevant section.
