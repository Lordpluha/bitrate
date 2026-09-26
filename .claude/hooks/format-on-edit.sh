#!/usr/bin/env bash
set -euo pipefail
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Formatting not run: python3 is unavailable.' >&2
  exit 0
fi
exec python3 -B "$(dirname -- "${BASH_SOURCE[0]}")/format_file.py"
