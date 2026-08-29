#!/usr/bin/env bash
# PreToolUse hook: blocks Read/Edit/Write/MultiEdit on files that hold secrets.
# Templates without secrets (.env.example, .env.sample, .env.template, .env.dist) stay
# allowed, since they are the thing a developer is supposed to copy.
#
# The Bash path (`cat .env`) is covered separately by the deny rules in settings.json —
# this hook only sees file tools.
set -euo pipefail

# jq is ~5ms, node ~25ms, and this runs on every file tool call. Prefer jq, keep node as the
# fallback so the hook still works on a machine without jq.
if command -v jq >/dev/null 2>&1; then
  file_path=$(jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
else
  file_path=$(node -e '
let data = "";
process.stdin.on("data", c => (data += c));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    process.stdout.write(input.tool_input && input.tool_input.file_path ? input.tool_input.file_path : "");
  } catch {
    process.stdout.write("");
  }
});
')
fi

[ -n "$file_path" ] || exit 0

base=$(basename -- "$file_path")

block() {
  echo "Blocked: $1 — do not read or edit it (project policy)." >&2
  exit 2
}

case "$base" in
  # Templates first: they must win over the .env.* pattern below.
  .env.example|.env.sample|.env.template|.env.dist)
    exit 0
    ;;
  .env|.env.*)
    block ".env files are off-limits"
    ;;
  # direnv config is executed shell that routinely exports credentials, and it does not
  # match .env* — it was previously readable.
  .envrc|.envrc.*)
    block ".envrc is direnv config and commonly holds credentials"
    ;;
  # Private keys and credential stores. settings.json denies Read on these; this closes
  # Edit/Write too, so a key cannot be created or overwritten through a file tool.
  id_rsa|id_rsa.*|id_ed25519|id_ed25519.*|id_ecdsa|id_ecdsa.*|*.pem|*.p12|*.pfx|*.keystore|*.jks)
    block "$base is a private key or keystore"
    ;;
  .netrc|_netrc|.pgpass|.git-credentials|credentials.json|service-account*.json)
    block "$base is a credential store"
    ;;
esac

exit 0
