#!/usr/bin/env bash
# PreToolUse guard that routes to graphify's hook-guard, wherever graphify actually works.
#
# This runs on EVERY Bash, Read, and Glob call, so resolution cost matters. Two environments
# have to be handled:
#   1. graphify on PATH and importable — call it directly.
#   2. Claude Code inside the VS Code Flatpak sandbox. graphify is installed on the host by
#      scripts/setup-graphify.mjs into a uv-managed venv whose interpreter is not resolvable
#      from inside the sandbox: the launcher exists and fails with
#      `ModuleNotFoundError: No module named 'graphify'`. The host copy works, so reach it
#      with `flatpak-spawn --host`.
#
# The winning transport is cached, because probing costs ~56ms and the losing candidates are
# probed first. Without the cache every tool call pays for two doomed probes before the one
# that works. A cached transport that later fails falls through to a fresh resolution, so a
# repaired or relocated install is picked up without anyone clearing the cache.
#
# If nothing works, exit 0. A guard that cannot run must not break every tool call in the
# session; it just stops guarding, and `graphify --version` will say why.
#
# Usage: graphify-guard.sh <search|read>
set -uo pipefail

MODE="${1:?usage: graphify-guard.sh <search|read>}"
PAYLOAD="$(cat)"
CACHE="${TMPDIR:-/tmp}/.br-graphify-transport.$(id -u)"

# Run a candidate against the payload. 0 = handled, 2 = the guard blocked the tool
# (propagate), anything else = this candidate is unusable, try the next.
#
# Output is buffered rather than streamed so a broken candidate's crash (the
# ModuleNotFoundError above) never reaches the transcript. Only a candidate that actually
# won gets to speak: stdout on success, stderr too on a block, since that is where Claude
# Code reads the reason.
attempt() {
  local out err rc
  err="$(mktemp)"
  out="$(printf '%s' "$PAYLOAD" | "$@" hook-guard "$MODE" 2>"$err")"
  rc=$?
  if [ "$rc" -eq 0 ]; then
    [ -n "$out" ] && printf '%s\n' "$out"
    rm -f "$err"; return 0
  fi
  if [ "$rc" -eq 2 ]; then
    [ -n "$out" ] && printf '%s\n' "$out"
    cat "$err" >&2; rm -f "$err"; exit 2
  fi
  rm -f "$err"; return 1
}

# Fast path: a previously resolved transport, no probe.
if [ -r "$CACHE" ]; then
  # shellcheck disable=SC2046
  attempt $(cat "$CACHE") && exit 0
fi

# Slow path: resolve, then cache the winner. Candidates are deduped by resolved target, so
# a PATH entry that is a symlink to ~/.local/bin is not probed twice.
seen=""
for candidate in "graphify" "$HOME/.local/bin/graphify" "flatpak-spawn --host graphify"; do
  bin="${candidate%% *}"
  [ "$bin" = "flatpak-spawn" ] || command -v "$bin" >/dev/null 2>&1 || continue
  real="$(readlink -f "$(command -v "$bin" 2>/dev/null)" 2>/dev/null || echo "$bin")"
  case " $seen " in *" $real "*) continue ;; esac
  seen="$seen $real"

  # shellcheck disable=SC2086
  if attempt $candidate; then
    printf '%s' "$candidate" > "$CACHE" 2>/dev/null || true
    exit 0
  fi
done

exit 0
