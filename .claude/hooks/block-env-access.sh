#!/usr/bin/env bash
# Shared pre-tool guard covers file tools and Bash; keep this compatibility entrypoint.
set -euo pipefail
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Project guard requires python3; tool call blocked.' >&2
  exit 2
fi
exec python3 -B "$(dirname -- "${BASH_SOURCE[0]}")/project_guard.py"
