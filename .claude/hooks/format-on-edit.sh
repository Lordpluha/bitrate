#!/usr/bin/env bash
# PostToolUse hook: runs `biome format --write` on files just touched by
# Edit/Write/MultiEdit, so formatting is fixed immediately instead of surfacing
# later at the lefthook pre-commit stage.
set -euo pipefail

# jq is ~5ms, node ~25ms, and this runs after every edit. Prefer jq, keep node as the
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

case "$file_path" in
  *node_modules/*|*/.next/*|*/dist/*|*/storybook-static/*|*.claude/worktrees/*)
    exit 0
    ;;
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css)
    ;;
  *)
    exit 0
    ;;
esac

[ -f "$file_path" ] || exit 0

repo_root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
biome_bin="$repo_root/node_modules/.bin/biome"

[ -x "$biome_bin" ] || exit 0

"$biome_bin" format --write "$file_path" >/dev/null 2>&1 || true

exit 0
