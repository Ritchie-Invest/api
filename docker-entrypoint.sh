#!/bin/sh
set -e

: "${SKIP_MIGRATIONS:=0}"
: "${MIGRATION_RETRIES:=3}"
: "${MIGRATION_RETRY_DELAY:=3}"

if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] ERROR: DATABASE_URL not set" >&2
  exit 1
fi

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
log_err() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >&2; }

SUPPRESS_ERR_TRAP=0
trap 'rc=$?; if [ $rc -ne 0 ] && [ "$SUPPRESS_ERR_TRAP" != "1" ]; then log_err "[entrypoint][fatal] Uncaught error (exit=$rc) line=$LINENO"; fi' ERR

PRISMA_CLI="node_modules/.bin/prisma"

run_migrations() {
  i=1
  last_error=""
  while [ "$i" -le "$MIGRATION_RETRIES" ]; do
    log "[migrate] Attempt $i/$MIGRATION_RETRIES..."
    tmp_file=$(mktemp)
    set +e
    SUPPRESS_ERR_TRAP=1
    "$PRISMA_CLI" migrate deploy >"$tmp_file" 2>&1
    status=$?
    SUPPRESS_ERR_TRAP=0
    set -e
    attempt_output="$(cat "$tmp_file")"
    if [ "$status" -eq 0 ]; then
      log "[migrate] Success"
      return 0
    fi
    last_error="$attempt_output"
    log_err "[migrate] Failed attempt $i: $last_error"
    i=$((i+1))
    if [ "$i" -le "$MIGRATION_RETRIES" ]; then
      log "[migrate] Retrying in ${MIGRATION_RETRY_DELAY}s"
      sleep "$MIGRATION_RETRY_DELAY"
    fi
  done
  log_err "[migrate] Giving up after $MIGRATION_RETRIES attempts: $last_error" >&2
  return 1
}

if [ "$SKIP_MIGRATIONS" != "1" ]; then
  log "[entrypoint] Running Prisma migrations"
  run_migrations
else
  log "[entrypoint] SKIP_MIGRATIONS=1 -> migrations skipped"
fi

if [ ! -f dist/main.js ]; then
  log_err "[entrypoint] ERROR: dist/main.js not found"
  exit 1
fi

log "[entrypoint] Starting application"
exec node dist/main.js
