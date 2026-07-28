#!/usr/bin/env bash
# PreToolUse hook: blocks Read/Edit/Write/MultiEdit on .env* files.
# Templates without secrets (.env.example, .env.sample, .env.template) stay allowed.
set -euo pipefail

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

[ -n "$file_path" ] || exit 0

base=$(basename -- "$file_path")

case "$base" in
  .env.example|.env.sample|.env.template|.env.dist)
    exit 0
    ;;
  .env|.env.*)
    echo "Blocked: .env files are off-limits — do not read or edit them (project policy)." >&2
    exit 2
    ;;
esac

exit 0
