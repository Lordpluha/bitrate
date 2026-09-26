<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@bitrate/api</h1>

## Description

## Project setup
1. Install dependencies
```bash
$ pnpm install
```

2. Start your first migration (needs db to be started)
```bash
$ pnpm run db:migration:start
```

> if you have problems try to use:
> ```bash
> pnpm run db:gen
> ```

3. Run your prisma server and app
```bash
$ pnpm run db:start && pnpm run start
```

## Scripts
### Start project
```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# debug mode
$ pnpm run start:debug

# production mode
$ pnpm run start:prod
```

### Linting and formating
```bash
$ pnpm run format

$ pnpm run lint
```

### Prisma
```bash
# start in development mode
$ pnpm run db:start

# start migrations in dev (needed for work)
$ pnpm run db:migration:start

# reset migrations
$ pnpm run db:migration:reset

# generate in dev
$ pnpm run db:gen

# generate in production
$ pnpm run db:gen:prod
```

### Tests
```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Development email verification

Registration requires email verification, and there are exactly two ways to get the link —
a real SMTP server, or the log. There is deliberately no third: a local mail-catcher container
(this repository ran MailHog until it was removed) is a whole extra service to keep alive for
something a log line already answers.

**Locally: the log.** Leave `SMTP_HOST` unset and set `DEV_MAIL_LOG_TOKENS=true`.
`MailService` builds no transporter without a host, so it prints the complete verification/reset
URL; open that URL in the matching user or
artist frontend to finish the flow. Without the flag the API logs only that mail went
unsent, with no link — which is a safe default, not a bug.

**Anywhere real: SMTP.** Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and
`EMAIL_FROM` and mail is sent for real. The flag is opt-in, defaults to `false`, and environment
validation rejects it when `NODE_ENV=production`. CI/E2E must use an SMTP transport and must not
depend on token logging.

## License
Nest is [MIT licensed](https://github.com/Lordpluha/bitrate/LICENSE).
