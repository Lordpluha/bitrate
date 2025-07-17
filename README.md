# Music Platform (Spotify Clone)

## Usefull links
- Chromatic - https://www.chromatic.com/library?appId=68787858d0b6a0a00b0ca47f
- Storybook - 

# Your first start

Start postgresql db on port 5432 (with autorestarting)
```bash
$ sudo docker compose up -d
```

Install deps
```bash
$ pnpm i
```

Start monorepo projects
```bash
$ turbo dev
```

## 📦 Tech Stack

### Client
- Next.js 15 App Router + Server Actions + middleware, TypeScript, PWA
- TurboBuild
- TailwindCSS, Module.css, clsx
- Zustand, React Hook Form + Zod
- i18n, MSW
- @tanstack/react-query (Codegen via openApiTS) + Socket.io
- Storybook, Shadcn UI
- Feature-Sliced Design
#### Testing
- Vitest (Unit)
- RTL (Intergration)
- msw + openapi-msw (mocks)
- Playwright (E2E)

### Android
- React Native, NativeBase, Zustand, Faker
- React Navigation
- i18n
- @tanstack/react-query + AsyncStorage + Persistor + Socket.io
#### Testing
- Jest (Unit)
- RTL/Native (Integration)
- detox (E2E)

### iOS
- Flutter
#### Testing
- Flutter testing utils

### MacOS
- Flutter
#### Testing
- Flutter testing utils

### Windows
- Tauri

### Linux
- Tauri

### Admin Panel
- AdminJS based on Prisma schema

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
#### Testing
- Jest

### Infrastructure
- Monorepo: TurboRepo + Pnpm
- Linting: ESLint, Prettier, Stylelint
- Git tools: Husky, Lint-staged, Commit-lint, Gitflow
- CI/CD: GitHub Actions, Docker, self-hosted Sentry
- Env: .env per app + .env.schema (Zod-based)
- Backup: `redis-cli --rdb`
- Docs: Mintlify

### Future features
- Microservices, Micro-Frontends, Web Components
- CDN + S3, Logs, Metrics

## 📄 License

MIT © 2025 Lordpluha
