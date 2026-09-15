#!/usr/bin/env bash
#
# Uploads the values in a local env file to a GitHub *environment* as secrets and variables, using
# the classification the deploy workflow expects.
#
# Environment scope rather than repository scope, because the same names hold different values per
# deployment target. A repository-scoped copy is not an error — an environment-bound job reads both,
# and environment only wins on a name collision — which is exactly why a leftover copy is dangerous:
# it silently applies to every environment that has not defined its own.
#
# Values are read from the file and piped straight into `gh` on stdin. They are never echoed, never
# passed as an argument (arguments are visible to anyone who can run `ps`), and never written to a
# temporary file. The script prints names only.
#
#   ./scripts/sync-env-to-github.sh                          # dry run against `production`
#   ./scripts/sync-env-to-github.sh --apply
#   ./scripts/sync-env-to-github.sh --env staging --apply path/to/.env
#
# The environment must already exist — creating it, and adding its required reviewer, is a manual
# step `gh` cannot do.
#
set -euo pipefail

REPO="${GITHUB_REPO:-Lordpluha/bitrate}"
ENVIRONMENT="production"

# Genuinely secret. Everything else about the deployment is configuration.
SECRETS=(
  POSTGRES_PASSWORD REDIS_PASSWORD JWT_SECRET DATABASE_URL
  # Carries the same credentials as DATABASE_URL. Only `migrate dev` uses a shadow database and
  # production runs `migrate deploy`, but the compose file passes it through, so dropping it here
  # would change what the container sees.
  SHADOW_DATABASE_URL
  SMTP_USER SMTP_PASS
  OAUTH_GOOGLE_CLIENT_SECRET OAUTH_FACEBOOK_APP_SECRET
  METRICS_TOKEN SENTRY_DSN
  # Per-environment by nature: staging is a different host, and a key that does not match its host
  # is useless.
  DEPLOY_SSH_KEY
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
  DEPLOY_HOST DEPLOY_USER DEPLOY_SSH_HOST_KEY
)

APPLY=false
ENV_FILE=".env"
expect_env=false
for arg in "$@"; do
  if [ "$expect_env" = true ]; then ENVIRONMENT="$arg"; expect_env=false; continue; fi
  case "$arg" in
    --apply) APPLY=true ;;
    --env) expect_env=true ;;
    --env=*) ENVIRONMENT="${arg#--env=}" ;;
    -*) echo "unknown flag: $arg" >&2; exit 2 ;;
    *) ENV_FILE="$arg" ;;
  esac
done
[ "$expect_env" = false ] || { echo "--env needs a name" >&2; exit 2; }

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
    printf '%s' "$value" | gh "$kind" set "$name" --env "$ENVIRONMENT" --repo "$REPO" >/dev/null
    printf '  %-30s → %s\n' "$name" "$kind"
  else
    printf '  %-30s would be set as %s\n' "$name" "$kind"
  fi
}

echo "repository:  $REPO"
echo "environment: $ENVIRONMENT"
echo "source:      $ENV_FILE"
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

# A name that failed to land is worse than one that was never set: the deploy aborts on a missing
# required value, but an optional one just silently reverts to a schema default.
if [ "$APPLY" = true ]; then
  echo
  echo "verifying what landed in $ENVIRONMENT:"
  landed_secrets="$(gh secret list --env "$ENVIRONMENT" --repo "$REPO" --json name --jq '.[].name' 2>/dev/null || true)"
  landed_vars="$(gh variable list --env "$ENVIRONMENT" --repo "$REPO" --json name --jq '.[].name' 2>/dev/null || true)"
  missing=0
  for n in "${SECRETS[@]}"; do
    [ -n "$(read_value "$n")" ] || continue
    printf '%s\n' "$landed_secrets" | grep -qx "$n" || { printf '  MISSING secret   %s\n' "$n"; missing=1; }
  done
  for n in "${VARIABLES[@]}"; do
    [ -n "$(read_value "$n")" ] || continue
    printf '%s\n' "$landed_vars" | grep -qx "$n" || { printf '  MISSING variable %s\n' "$n"; missing=1; }
  done
  [ "$missing" -eq 0 ] && echo "  everything that had a value is present"
fi
