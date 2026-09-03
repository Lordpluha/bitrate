#!/usr/bin/env bash
#
# Uploads the values in a local env file to GitHub as repository secrets and variables, using the
# classification the deploy workflow expects.
#
# Values are read from the file and piped straight into `gh` on stdin. They are never echoed, never
# passed as an argument (arguments are visible to anyone who can run `ps`), and never written to a
# temporary file. The script prints names only.
#
#   ./scripts/sync-env-to-github.sh              # dry run: shows what would be set, by name
#   ./scripts/sync-env-to-github.sh --apply      # actually sets them
#   ./scripts/sync-env-to-github.sh --apply path/to/.env
#
set -euo pipefail

REPO="${GITHUB_REPO:-Lordpluha/bitrate}"

# Genuinely secret. Everything else about the deployment is configuration.
SECRETS=(
  POSTGRES_PASSWORD REDIS_PASSWORD JWT_SECRET DATABASE_URL
  SMTP_USER SMTP_PASS
  OAUTH_GOOGLE_CLIENT_SECRET OAUTH_FACEBOOK_APP_SECRET
  METRICS_TOKEN SENTRY_DSN
)

# Not secret: hostnames, ports, durations, cookie names, and the NEXT_PUBLIC_* values that are
# compiled into a client bundle any visitor can read.
VARIABLES=(
  NODE_ENV PORT DOMAIN
  WEB_HOST USER_WEB_HOST ARTIST_WEB_HOST API_BASE_URL API_URL
  NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL
  POSTGRES_USER POSTGRES_DB REDIS_HOST REDIS_PORT
  SMTP_HOST SMTP_PORT EMAIL_FROM
  ACCESS_TOKEN_NAME REFRESH_TOKEN_NAME JWT_ACCESS_EXPIRES_IN JWT_REFRESH_EXPIRES_IN
  STORAGE_DRIVER TRUST_PROXY_HOPS HEALTH_CHECK_TIMEOUT_MS DEV_MAIL_LOG_TOKENS
  OAUTH_GOOGLE_CLIENT_ID OAUTH_FACEBOOK_APP_ID
)

APPLY=false
ENV_FILE=".env"
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=true ;;
    -*) echo "unknown flag: $arg" >&2; exit 2 ;;
    *) ENV_FILE="$arg" ;;
  esac
done

[ -f "$ENV_FILE" ] || { echo "no such file: $ENV_FILE" >&2; exit 1; }
command -v gh >/dev/null || { echo "gh is not installed" >&2; exit 1; }

# Reads one value without printing it. Strips surrounding quotes, keeps everything else verbatim so
# a password containing '#' or '=' survives.
read_value() {
  sed -n "s/^[[:space:]]*$1=//p" "$ENV_FILE" | tail -1 \
    | sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

in_list() { local n=$1; shift; for x in "$@"; do [ "$x" = "$n" ] && return 0; done; return 1; }

set_one() {
  local kind=$1 name=$2 value
  value="$(read_value "$name")"
  if [ -z "$value" ]; then
    printf '  %-30s skipped — not present\n' "$name"
    return
  fi
  if [ "$APPLY" = true ]; then
    printf '%s' "$value" | gh "$kind" set "$name" --repo "$REPO" >/dev/null
    printf '  %-30s → %s\n' "$name" "$kind"
  else
    printf '  %-30s would be set as %s\n' "$name" "$kind"
  fi
}

echo "repository: $REPO"
echo "source:     $ENV_FILE"
[ "$APPLY" = true ] || echo "(dry run — pass --apply to write)"

echo
echo "secrets:"
for n in "${SECRETS[@]}"; do set_one secret "$n"; done

echo
echo "variables:"
for n in "${VARIABLES[@]}"; do set_one variable "$n"; done

# Anything in the file that neither list claims would be silently dropped from the rendered .env,
# and the API would then fall back to a default or fail its schema at boot.
echo
echo "present in the file but classified by neither list:"
grep -oE '^[[:space:]]*[A-Z_][A-Z0-9_]*=' "$ENV_FILE" | tr -d ' =' | sort -u | while read -r n; do
  in_list "$n" "${SECRETS[@]}" || in_list "$n" "${VARIABLES[@]}" || printf '  %s\n' "$n"
done
