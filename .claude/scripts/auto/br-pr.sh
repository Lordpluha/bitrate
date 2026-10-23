#!/usr/bin/env bash
# Pull-request access for the /br-auto pipeline.
#
# Unlike the GitLab pipeline this was modelled on, GitHub has a first-class CLI, so
# this is a thin wrapper over `gh` rather than hand-rolled REST calls. `gh` owns the
# token: never pass one on the command line, never echo one, never write one to a
# file. If `run_gh auth status` fails, that is the user's to fix — see `verify`.
#
# Every subcommand is idempotent. `create` is a no-op when an open PR already exists for
# the branch, because a re-run of the pipeline must never open a second PR.
#
# Usage:
#   br-pr.sh verify
#   br-pr.sh create  <branch> <title> <body-file>
#   br-pr.sh update  <branch> <title> <body-file>   # rewrite after rework
#   br-pr.sh state   <branch>          # open/merged/closed + draft + mergeable + checks
#   br-pr.sh notes   <branch>          # reviewer feedback, unresolved review threads first
#   br-pr.sh comment <branch> <file>   # post an issue-comment on the PR
set -euo pipefail

BASE_BRANCH="${SP_BASE_BRANCH:-develop}"

die() { printf 'ERROR: %s\n' "$1" >&2; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# Resolve how to reach gh, and remember it in GH_TRANSPORT.
#
# Claude Code may run inside the VS Code Flatpak sandbox, whose /usr is the
# Flatpak runtime's rather than the host's. `gh` is then installed on the host
# and simply invisible here — `command -v gh` fails while the user's own
# terminal runs gh fine. `flatpak-spawn --host` is the supported escape hatch,
# so fall back to it before concluding gh is missing.
GH_BIN=()
GH_TRANSPORT=""

resolve_gh() {
  [[ -n "$GH_TRANSPORT" ]] && return 0
  if command -v gh >/dev/null 2>&1; then
    GH_BIN=(gh); GH_TRANSPORT=native; return 0
  fi
  if command -v flatpak-spawn >/dev/null 2>&1 \
     && flatpak-spawn --host gh --version >/dev/null 2>&1; then
    GH_BIN=(flatpak-spawn --host gh); GH_TRANSPORT=flatpak-host; return 0
  fi
  die "gh CLI is not reachable — not on PATH, and no host gh via flatpak-spawn. \
The /br-auto pipeline cannot run without it."
}

run_gh() { resolve_gh; "${GH_BIN[@]}" "$@"; }

# A file passed to host gh must exist on the HOST filesystem. Under the Flatpak
# sandbox the repo is shared with the host but /tmp is NOT, so a body file
# written to a sandbox temp dir is invisible to host gh and gh fails with a
# confusing "no such file". Require body files to live inside the repo.
check_body_file() {
  local file="$1"
  [[ -f "$file" ]] || die "body file not found: $file"
  resolve_gh
  [[ "$GH_TRANSPORT" == flatpak-host ]] || return 0
  local abs; abs="$(cd "$(dirname "$file")" && pwd)/$(basename "$file")"
  case "$abs" in
    "$REPO_ROOT"/*) return 0 ;;
    *) die "body file must live inside the repo when gh runs on the host \
(sandbox /tmp is not visible to it): $abs — write it under $REPO_ROOT/.br-scratch/ instead" ;;
  esac
}

# Prints "<number> <url>" of the branch's newest PR in <state> (default: open), or nothing.
# create/update/comment must only see an OPEN PR: a reused branch name would otherwise
# resolve to an old merged/closed PR and the write would land on it.
pr_for() {
  local branch="${1:?}" state="${2:-open}"
  run_gh pr list --head "$branch" --state "$state" --limit 1 --json number,url \
    -q '.[0] | select(. != null) | "\(.number) \(.url)"' 2>/dev/null
}

cmd_verify() {
  resolve_gh
  run_gh auth status >/dev/null 2>&1 || die "gh is not authenticated — run 'gh auth login'"
  # read:project is what the board queries need; gh reports granted scopes here.
  local scopes
  scopes="$(run_gh auth status 2>&1 | sed -nE "s/.*Token scopes: (.*)/\1/p" | head -1)"
  printf 'GH_TRANSPORT=%s\n' "$GH_TRANSPORT"
  printf 'REPO=%s\n' "$(run_gh repo view --json nameWithOwner -q .nameWithOwner)"
  printf 'BASE=%s\n' "$BASE_BRANCH"
  printf 'SCOPES=%s\n' "${scopes:-unknown}"
  case "$scopes" in
    *project*) printf 'PROJECT_SCOPE=yes\n' ;;
    *)         printf 'PROJECT_SCOPE=no\nHINT=run `gh auth refresh -s read:project,project` for board access\n' ;;
  esac
}

cmd_state() {
  resolve_gh
  local branch="${1:?branch required}" json
  json="$(run_gh pr list --head "$branch" --state all --limit 1 \
    --json number,url,state,isDraft,mergeable,reviewDecision,statusCheckRollup \
    -q '.[0] // empty' 2>/dev/null)"
  if [[ -z "$json" ]]; then printf 'PR_STATE=none\n'; return 0; fi
  printf '%s' "$json" | jq -r '
    "PR_NUMBER=\(.number)",
    "PR_URL=\(.url)",
    "PR_STATE=\(.state | ascii_downcase)",
    "PR_DRAFT=\(.isDraft)",
    "PR_MERGEABLE=\(.mergeable // "UNKNOWN")",
    "PR_REVIEW=\(.reviewDecision // "NONE")",
    "PR_CHECKS=\(
       (.statusCheckRollup // []) as $c
       | if ($c | length) == 0 then "none"
         elif ($c | map(select((.conclusion // "") == "FAILURE")) | length) > 0 then "failing"
         elif ($c | map(select(.status != "COMPLETED")) | length) > 0 then "running"
         else "passing" end)"
  '
}

# Reviewer feedback. Unresolved review threads come first because those are the
# ones that actually block the PR; general issue-comments follow as context.
cmd_notes() {
  resolve_gh
  local branch="${1:?branch required}" pr num
  pr="$(pr_for "$branch" all)"
  num="${pr%% *}"
  [[ -n "$num" ]] || { printf 'no PR for %s\n' "$branch"; return 0; }

  local repo owner name
  repo="$(run_gh repo view --json nameWithOwner -q .nameWithOwner)"
  owner="${repo%%/*}"; name="${repo##*/}"

  printf '=== unresolved review threads ===\n'
  run_gh api graphql -f query='
    query($owner:String!,$name:String!,$num:Int!){
      repository(owner:$owner,name:$name){
        pullRequest(number:$num){
          reviewThreads(first:100){
            nodes{
              isResolved
              path
              line
              comments(first:20){ nodes{ author{login} body } }
            }
          }
        }
      }
    }' -F owner="$owner" -F name="$name" -F num="$num" \
    --jq '.data.repository.pullRequest.reviewThreads.nodes[]
          | select(.isResolved | not)
          | "--- \(.path):\(.line // 0)\n"
            + (.comments.nodes | map("@\(.author.login): \(.body)") | join("\n"))' \
    2>/dev/null || printf '(review threads unavailable)\n'

  printf '\n=== PR comments ===\n'
  run_gh pr view "$num" --json comments \
    -q '.comments[] | "@\(.author.login): \(.body)"' 2>/dev/null || true

  printf '\n=== reviews ===\n'
  run_gh pr view "$num" --json reviews \
    -q '.reviews[] | select(.body != "") | "@\(.author.login) [\(.state)]: \(.body)"' 2>/dev/null || true
}

cmd_comment() {
  resolve_gh
  local branch="${1:?branch required}" file="${2:?body file required}" pr num
  check_body_file "$file"
  pr="$(pr_for "$branch")"
  num="${pr%% *}"
  [[ -n "$num" ]] || die "no open PR for $branch"
  run_gh pr comment "$num" --body-file "$file" >/dev/null
  printf 'commented on PR #%s\n' "$num"
}

cmd_create() {
  resolve_gh
  local branch="${1:?branch required}" title="${2:?title required}" file="${3:?body file required}"
  check_body_file "$file"

  local existing
  existing="$(pr_for "$branch")"
  if [[ -n "$existing" ]]; then
    printf 'PR_NUMBER=%s\nPR_URL=%s\nPR_STATE=existing\n' "${existing%% *}" "${existing#* }"
    return 0
  fi

  # gh prints the new PR's URL on stdout; its last path segment is the number.
  local url
  url="$(run_gh pr create --head "$branch" --base "$BASE_BRANCH" \
    --title "$title" --body-file "$file")" \
    || die "gh pr create failed for $branch"
  url="$(printf '%s\n' "$url" | tail -n 1)"
  printf 'PR_NUMBER=%s\nPR_URL=%s\nPR_STATE=created\n' "${url##*/}" "$url"
}

cmd_update() {
  resolve_gh
  local branch="${1:?branch required}" title="${2:?title required}" file="${3:?body file required}"
  check_body_file "$file"
  local pr num
  pr="$(pr_for "$branch")"
  num="${pr%% *}"
  [[ -n "$num" ]] || die "no open PR for $branch — use 'create'"
  run_gh pr edit "$num" --title "$title" --body-file "$file" >/dev/null
  printf 'PR_NUMBER=%s\nPR_URL=%s\nPR_STATE=updated\n' "$num" "${pr#* }"
}

case "${1:-}" in
  verify)  shift; cmd_verify  "$@" ;;
  create)  shift; cmd_create  "$@" ;;
  update)  shift; cmd_update  "$@" ;;
  state)   shift; cmd_state   "$@" ;;
  notes)   shift; cmd_notes   "$@" ;;
  comment) shift; cmd_comment "$@" ;;
  *) die "usage: br-pr.sh {verify|create|update|state|notes|comment} [args]" ;;
esac
