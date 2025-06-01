# Music Platform (Spotify Clone)

[![Lordpluha](https://img.shields.io/badge/author-@Lordpluha-blue)](https://github.com/Lordpluha)

A full-featured music platform inspired by Spotify, built with a modern monorepo architecture and a fully self-hosted stack.

## 🎯 Project Goals
- Modern, scalable, full-stack application
- Self-hosted to minimize recurring costs
- Learn and apply advanced architecture patterns and DevOps workflows

## 📦 Tech Stack

### Client
- Next.js 15 App Router + Server Actions + middleware
- TurboBuild + ESBuild
- TypeScript, TailwindCSS, Module.css, clsx
- Zustand, React Hook Form + Zod
- i18n, MSW
- @tanstack/react-query (Codegen via openApiTS) + Socket.io
- Storybook, Shadcn UI
- Vitest (unit, integration, E2E), Screenshot testing
- Feature-Sliced Design

### Mobile App
- React Native, NativeBase, Zustand, Faker
- React Navigation
- i18n
- @tanstack/react-query + AsyncStorage + Persistor + Socket.io

### Admin Panel
- NestJS Admin

### Backend
- NestJS, TypeScript
- MongoDB/PostgreSQL via Mongoose/Prisma(TypeORM)
- REST API, SSE, Socket.io, Long-polling, RabbitMQ
- JWT, OAuth, CORS, CSP, 2FA, Redis
- Swagger + Zod (codegen sync)
- Postfix + NodeMailer, Multer
- Contracts, @nestjs/throttler, Fingerprint auth
- ConfigModule, @nestjs/schedule (CRON)
- Prometheus + Grafana, nestjs-pino

### Infrastructure
- Monorepo: TurboRepo + Pnpm
- Linting: ESLint, Prettier, Stylelint
- Git tools: Husky, Lint-staged, Commit-lint, Gitflow
- CI/CD: GitHub Actions, Docker, self-hosted Sentry
- Env: .env per app + .env.schema (Zod-based)
- Backup: `mongodump`, `redis-cli --rdb`
- Docs: Mintlify

### Future Migrations
- GraphQL, Tauri, AdminJS
- Microservices, Micro-Frontends, Web Components
- CDN + S3, Logs, Metrics

## 📄 License

MIT © 2025 Lordpluha
