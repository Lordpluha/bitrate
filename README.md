# Music Platform (Spotify Clone)

# Postman
https://app.getpostman.com/join-team?invite_code=1fd6000a0cd8139ff2657eb1b9ce483c6ae18ac6b3b3877e612ee8bfc60166ea&target_code=47584a9ad7cb0c5ee8c584d35aa1a88e

# How to start db

start postgresql db on port 5432 (with autorestarting)
```
sudo docker compose up -d
```

```
turbo dev
```

## 📦 Tech Stack

### Client
- Next.js 15 App Router + Server Actions + middleware, TypeScript
- TurboBuild
- TailwindCSS, Module.css, clsx
- Zustand, React Hook Form + Zod
- i18n, MSW
- @tanstack/react-query (Codegen via openApiTS) + Socket.io
- Storybook, Shadcn UI
- Vitest (unit, integration, E2E), Screenshot testing
- Feature-Sliced Design

### Android
- React Native, NativeBase, Zustand, Faker
- React Navigation
- i18n
- @tanstack/react-query + AsyncStorage + Persistor + Socket.io

### iOS
- Flutter

### MacOS
- Flutter

### Windows
- Tauri

### Linux
- Tauri

### Admin Panel
- NestJS Admin

### Backend
- NestJS, TypeScript
- PostgreSQL via Prisma
- REST API, SSE, Socket.io, Long-polling, RabbitMQ
- JWT, OAuth, CORS, CSP, 2FA, Redis
- Swagger + Zod (codegen sync)
- Postfix + NodeMailer, Multer
- @nestjs/throttler, Fingerprint auth
- ConfigModule, @nestjs/schedule (CRON)
- Prometheus + Grafana, nestjs-pino

### Infrastructure
- Monorepo: TurboRepo + Pnpm
- Linting: ESLint, Prettier, Stylelint
- Git tools: Husky, Lint-staged, Commit-lint, Gitflow
- CI/CD: GitHub Actions, Docker, self-hosted Sentry
- Env: .env per app + .env.schema (Zod-based)
- Backup: `redis-cli --rdb`
- Docs: Mintlify

### Future features
- GraphQL, AdminJS
- Microservices, Micro-Frontends, Web Components
- CDN + S3, Logs, Metrics

## 📄 License

MIT © 2025 Lordpluha
