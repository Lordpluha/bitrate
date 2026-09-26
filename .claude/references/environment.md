# Host environment

## Host tools: check, don't assume

`gh`, `docker` and `graphify` are host-installed tools whose availability depends on how the
editor was launched. **Probe once (`command -v <tool>`) rather than reasoning about it** —
both of the following are real and neither is the default:

- **Launched normally**, the tools resolve directly and are called as themselves. This is the
  common case; `graphify query "<question>"` is exactly that command.
- **Launched from VS Code installed as a Flatpak**, the shell runs inside the
  `com.visualstudio.code` sandbox, whose `/usr` belongs to the Flatpak runtime. There the same
  tools are absent — and `graphify` is worse than absent: its launcher resolves but dies with
  `ModuleNotFoundError`, because its uv venv lives outside the sandbox. Reach them with
  `flatpak-spawn --host <tool> …`. `.claude/scripts/auto/br-pr.sh` handles the PR-command fallback. For graphify, probe
  direct invocation once and use the host transport if it fails. The legacy graphify guard
  wrapper remains on disk but is not registered: its mandatory-search reminder conflicts
  with the scoped exploration policy.

Two consequences that only apply inside the sandbox: the repository is shared with the host
but **`/tmp` is not**, so any file handed to a host command must live inside the repo (use the
gitignored `.br-scratch/`, never the session scratchpad, for PR bodies and issue comments);
and `pnpm`, `node`, `git` and `rg` resolve in both cases, so a failure there is a real failure.

If `gh` is missing in both transports, say so plainly: the ticket, board and PR half of this
workflow (`br-manager`, `/br-auto`, `br-pr.sh`) cannot run, and no MCP server substitutes for
it today.
