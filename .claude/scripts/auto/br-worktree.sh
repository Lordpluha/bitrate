#!/usr/bin/env bash
# Worktree + branch lifecycle for the /br-auto pipeline.
#
# Every issue gets its own worktree branched off a freshly fetched origin/develop.
# Parallel workers therefore never share a git index, and none of them inherits the
# dirty state of whatever branch the interactive session happens to be sitting on.
#
# `state` and `scan` exist for crash recovery: the pipeline stores no journal it has
# to trust — it re-derives what stage an issue reached from git itself, which is the
# only local source that cannot lie.
#
# Keys are bare GitHub issue numbers. Branches follow .claude/rules/commit-style.md
# (`<type>/<slug>`) with the issue number embedded so recovery can map a branch back
# to its issue: `feat/123-audio-streaming`.
#
# Usage:
#   br-worktree.sh claim   123 feat "Add audio streaming"
#   br-worktree.sh adopt   123        # re-attach a worktree to an existing branch
#   br-worktree.sh state   123        # ground truth for recovery
#   br-worktree.sh scan               # every issue this repo has work in flight for
#   br-worktree.sh release 123        # drop worktree, keep branch (success path)
#   br-worktree.sh abandon 123        # drop worktree and branch (failure path)
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
WT_ROOT="$REPO_ROOT/.claude/worktrees"
LOCK_ROOT="$WT_ROOT/.locks"
BASE_BRANCH="${SP_BASE_BRANCH:-develop}"

die() { printf 'ERROR: %s\n' "$1" >&2; exit 1; }

check_key() {
  [[ "${1:-}" =~ ^[0-9]+$ ]] || die "malformed issue number: ${1:-<empty>} (expected digits)"
}

# Conventional Commits branch prefixes, per .claude/rules/commit-style.md.
check_type() {
  case "${1:-}" in
    feat|fix|docs|chore|refactor|test|hotfix) return 0 ;;
    *) die "invalid branch type: ${1:-<empty>} (feat|fix|docs|chore|refactor|test|hotfix)" ;;
  esac
}

# Cyrillic summaries slugify to nothing; `<type>/<issue>` is still a valid branch
# name, so fall back to it instead of failing the claim.
slugify() {
  printf '%s' "$1" \
    | sed -E 's/^\[[^]]*\]:?[[:space:]]*//' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' \
    | cut -c1-40 \
    | sed -E 's/-+$//'
}

# Any branch whose slug segment starts with this issue number.
local_branch_for() {
  git branch --list "*/$1-*" "*/$1" --format='%(refname:short)' | head -n1
}

remote_branch_for() {
  git ls-remote --heads origin "*/$1-*" "*/$1" 2>/dev/null \
    | sed -E 's#.*refs/heads/##' | head -n1
}

# A fresh worktree has no node_modules — pnpm installs them per directory and git
# does not carry ignored files across. Without this a worker burns most of its run
# on `pnpm install` before writing a line of code.
#
# Symlinking the main checkout's trees is wrong: Next.js/Turbopack rejects a
# node_modules symlink that escapes the project root, so `next build` — and with it
# the lefthook pre-push hook and CI — could never pass in the worktree. Install for
# real; pnpm hardlinks from its global store, so this costs far less than a cold
# install and produces a tree the build actually accepts.
prepare_deps() {
  local path="$1"
  if ! command -v pnpm >/dev/null 2>&1; then
    printf 'DEPS=skipped-no-pnpm\n'; return 0
  fi
  if (cd "$path" && pnpm install --frozen-lockfile --prefer-offline >/dev/null 2>&1); then
    printf 'DEPS=installed\n'; return 0
  fi
  # A branch that legitimately changes dependencies fails --frozen-lockfile; retry
  # without it rather than handing the worker a half-installed tree.
  if (cd "$path" && pnpm install --prefer-offline >/dev/null 2>&1); then
    printf 'DEPS=stale-lockfile\n'; return 0
  fi
  printf 'DEPS=failed\n'
  printf 'HINT=run `pnpm install` inside the worktree before building\n'
}

cmd_claim() {
  local key="${1:?issue number required}" type="${2:?branch type required}" summary="${3:-}"
  check_key "$key"
  check_type "$type"

  mkdir -p "$LOCK_ROOT"
  # mkdir is atomic — it IS the claim, so two dispatchers cannot take one issue.
  mkdir "$LOCK_ROOT/$key" 2>/dev/null || die "issue #$key is already claimed"

  local slug branch path
  slug="$(slugify "$summary")"
  branch="$type/$key${slug:+-$slug}"
  path="$WT_ROOT/$key"

  git fetch --quiet origin "$BASE_BRANCH" || { rmdir "$LOCK_ROOT/$key"; die "cannot fetch origin/$BASE_BRANCH"; }

  if [[ -n "$(remote_branch_for "$key")" ]]; then
    rmdir "$LOCK_ROOT/$key"
    die "remote branch for #$key already exists — use 'adopt' to resume it"
  fi
  if [[ -e "$path" ]]; then
    rmdir "$LOCK_ROOT/$key"
    die "worktree path already exists: $path"
  fi

  git worktree add --quiet -b "$branch" "$path" "origin/$BASE_BRANCH" \
    || { rmdir "$LOCK_ROOT/$key"; die "worktree add failed"; }

  printf 'WORKTREE=%s\nBRANCH=%s\nBASE=origin/%s\n' "$path" "$branch" "$BASE_BRANCH"
  prepare_deps "$path"
}

# Re-attach to work that already exists — after a crash, or when a reviewer sends
# an issue back and its branch is still on the remote.
cmd_adopt() {
  local key="${1:?issue number required}"
  check_key "$key"
  local path="$WT_ROOT/$key" branch

  mkdir -p "$LOCK_ROOT"
  mkdir "$LOCK_ROOT/$key" 2>/dev/null || true

  git fetch --quiet origin "$BASE_BRANCH" || true
  branch="$(local_branch_for "$key")"
  if [[ -z "$branch" ]]; then
    branch="$(remote_branch_for "$key")"
    [[ -n "$branch" ]] || die "no local or remote branch found for #$key"
    git fetch --quiet origin "$branch:$branch" 2>/dev/null || git fetch --quiet origin "$branch" || true
  fi

  if [[ -d "$path" ]]; then
    printf 'WORKTREE=%s\nBRANCH=%s\nADOPTED=existing\n' "$path" "$branch"
    return 0
  fi

  git worktree add --quiet "$path" "$branch" || die "worktree add failed for $branch"
  # Fast-forward onto the reviewer's latest remote state if it moved ahead.
  git -C "$path" pull --quiet --ff-only origin "$branch" 2>/dev/null || true
  printf 'WORKTREE=%s\nBRANCH=%s\nADOPTED=recreated\n' "$path" "$branch"
  prepare_deps "$path"
}

cmd_state() {
  local key="${1:?issue number required}"
  check_key "$key"
  local path="$WT_ROOT/$key" branch remote_exists=no dirty=no commits=0 unpushed=0

  branch="$(local_branch_for "$key")"
  [[ -n "$branch" ]] || branch="$(remote_branch_for "$key")"

  if [[ -n "$branch" ]] && git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    remote_exists=yes
  fi

  if [[ -d "$path" ]]; then
    if [[ -n "$(git -C "$path" status --porcelain 2>/dev/null)" ]]; then dirty=yes; fi
    commits="$(git -C "$path" rev-list --count "origin/$BASE_BRANCH..HEAD" 2>/dev/null || echo 0)"
    if [[ "$remote_exists" == yes ]]; then
      git -C "$path" fetch --quiet origin "$branch" 2>/dev/null || true
      unpushed="$(git -C "$path" rev-list --count "origin/$branch..HEAD" 2>/dev/null || echo 0)"
    else
      unpushed="$commits"
    fi
  elif [[ -n "$branch" ]] && git show-ref --verify --quiet "refs/heads/$branch"; then
    commits="$(git rev-list --count "origin/$BASE_BRANCH..$branch" 2>/dev/null || echo 0)"
    if [[ "$remote_exists" == yes ]]; then
      unpushed="$(git rev-list --count "origin/$branch..$branch" 2>/dev/null || echo 0)"
    else
      unpushed="$commits"
    fi
  fi

  printf 'ISSUE=%s\n'     "$key"
  printf 'LOCK=%s\n'      "$([[ -d "$LOCK_ROOT/$key" ]] && echo yes || echo no)"
  printf 'WORKTREE=%s\n'  "$([[ -d "$path" ]] && echo "$path" || echo none)"
  printf 'BRANCH=%s\n'    "${branch:-none}"
  printf 'REMOTE=%s\n'    "$remote_exists"
  printf 'DIRTY=%s\n'     "$dirty"
  printf 'COMMITS=%s\n'   "$commits"
  printf 'UNPUSHED=%s\n'  "$unpushed"
}

# Tags every issue with why it showed up. A lock or a worktree means this pipeline
# has work genuinely in flight; a bare local branch is usually just an old branch
# from manual work and must not be mistaken for an interrupted run.
cmd_scan() {
  local key sources
  { ls -1 "$LOCK_ROOT" 2>/dev/null || true
    ls -1 "$WT_ROOT" 2>/dev/null | grep -vE '^\.locks$' || true
    git branch --list '*/*' --format='%(refname:short)' \
      | sed -nE 's#^[a-z]+/([0-9]+)(-.*)?$#\1#p'
  } | grep -E '^[0-9]+$' | sort -un | while read -r key; do
    sources=""
    if [[ -d "$LOCK_ROOT/$key" ]]; then sources+="lock,"; fi
    if [[ -d "$WT_ROOT/$key" ]];   then sources+="worktree,"; fi
    if [[ -n "$(local_branch_for "$key")" ]]; then sources+="branch,"; fi
    printf '%s\t%s\n' "$key" "${sources%,}"
  done
}

cmd_release() {
  local key="${1:?issue number required}"
  check_key "$key"
  git worktree remove --force "$WT_ROOT/$key" 2>/dev/null || true
  rmdir "$LOCK_ROOT/$key" 2>/dev/null || true
  git worktree prune
  printf 'released #%s (branch kept)\n' "$key"
}

cmd_abandon() {
  local key="${1:?issue number required}" branch
  check_key "$key"
  branch="$(git -C "$WT_ROOT/$key" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  git worktree remove --force "$WT_ROOT/$key" 2>/dev/null || true
  rmdir "$LOCK_ROOT/$key" 2>/dev/null || true
  git worktree prune
  # Only ever touch a branch whose name still maps to the issue we were told to
  # drop, and only with -d so a branch holding unmerged work survives.
  if [[ -n "$branch" && "$branch" =~ ^[a-z]+/${key}(-|$) ]]; then
    git branch -d "$branch" 2>/dev/null \
      || printf 'kept branch %s (unmerged commits)\n' "$branch"
  fi
  printf 'abandoned #%s\n' "$key"
}

case "${1:-}" in
  claim)   shift; cmd_claim   "$@" ;;
  adopt)   shift; cmd_adopt   "$@" ;;
  state)   shift; cmd_state   "$@" ;;
  scan)    shift; cmd_scan    "$@" ;;
  release) shift; cmd_release "$@" ;;
  abandon) shift; cmd_abandon "$@" ;;
  *) die "usage: br-worktree.sh {claim|adopt|state|scan|release|abandon} [args]" ;;
esac
