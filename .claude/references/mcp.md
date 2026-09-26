# Project MCP reference

## MCP servers

`.mcp.json` wires six project-scoped servers, and `.claude/settings.json` approves them by
name in `enabledMcpjsonServers`, so they start without a per-session prompt. The list is
deliberate rather than `enableAllProjectMcpServers`: adding a server to `.mcp.json` should be
a visible line in a review, not something that auto-connects because it landed in the file.

All six are optional — if one fails to start, fall back to the CLI or UI it wraps. Two fail
routinely and that is expected, not a problem to chase: `storybook` is absent unless the
catalogue is running locally, and `sentry` stays unauthorized until someone completes its
OAuth in an interactive session (`/mcp`).

| Server | Command | Use it for |
| --- | --- | --- |
| `shadcn` | `pnpm dlx shadcn@latest mcp` | Registry search and component install before hand-rolling UI — pairs with the `shadcn` and `ui-react-rules` skills. |
| `playwright` | `pnpm dlx @playwright/mcp@latest` | Driving a real browser for E2E and screenshot work in `apps/web-player` / `apps/web-artists`. |
| `chrome-devtools` | `pnpm dlx chrome-devtools-mcp@latest` | Network, console and performance traces on a running page — CMAF/MSE playback debugging. |
| `prisma` | `pnpm --filter @bitrate/api exec prisma mcp` | Schema and migration work in `apps/api`; runs in that workspace so `prisma.config.ts` and its env loading apply. |
| `storybook` | `http://localhost:6006/mcp` | The ui-kit catalogue: which components, variants and stories already exist. Served by `@storybook/addon-mcp` — needs `pnpm --filter @bitrate/ui-react storybook` running, otherwise the server is simply absent. |
| `sentry` | `https://mcp.sentry.dev/mcp` | Issues, stack traces and releases for the API and web player. Remote server, OAuth on first use — no token in the repo. |
