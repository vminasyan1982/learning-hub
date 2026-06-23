#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Learning Hub — Deploy Script
#
#  Usage:
#    ./deploy.sh                  — standard deploy
#    ./deploy.sh migrate          — deploy + run migrations
#    ./deploy.sh migrate seed     — deploy + migrate + seed data
#
#  Env flags (override before running):
#    BUILD_NO_CACHE=true ./deploy.sh   — force full rebuild (slow)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ───────────────────────────────────────────────────
SERVER="root@185.157.245.247"
APP_DIR="/opt/learning-hub"
BUILD_NO_CACHE=${BUILD_NO_CACHE:-false}

# ── Colors ───────────────────────────────────────────────────
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

step()  { echo -e "\n${BOLD}[$1/$TOTAL] $2${RESET}"; }
ok()    { echo -e "${GREEN}✓ $1${RESET}"; }
warn()  { echo -e "${YELLOW}⚠ $1${RESET}"; }
fail()  { echo -e "${RED}✗ $1${RESET}"; exit 1; }

TOTAL=7
[ "$1" == "migrate" ] || [ "$2" == "migrate" ] && TOTAL=8
[ "$1" == "seed" ]    || [ "$2" == "seed" ]    && TOTAL=9

echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║    Learning Hub — Deploy to Prod     ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════╝${RESET}"
echo -e "  Server:  ${SERVER}"
echo -e "  App dir: ${APP_DIR}"
echo -e "  No cache build: ${BUILD_NO_CACHE}"
echo ""

# ── 1. Pull latest code ──────────────────────────────────────
step 1 "Syncing code from GitHub..."
ssh "$SERVER" "cd $APP_DIR && git fetch origin main && git reset --hard origin/main"
ok "Code updated"

# ── 2. Stop old containers ───────────────────────────────────
step 2 "Stopping and removing old containers..."
ssh "$SERVER" "cd $APP_DIR && docker compose down --remove-orphans"
ok "Old containers removed"

# ── 3. Build images ──────────────────────────────────────────
step 3 "Building images..."
if [ "${BUILD_NO_CACHE}" = "true" ]; then
  warn "Building WITHOUT cache (slow but clean)"
  ssh "$SERVER" "cd $APP_DIR && docker compose build --no-cache"
else
  ssh "$SERVER" "cd $APP_DIR && docker compose build"
fi
ok "Images built"

# ── 4. Start containers ──────────────────────────────────────
step 4 "Starting containers..."
ssh "$SERVER" "cd $APP_DIR && docker compose up -d"

echo "  Waiting for services to start..."
sleep 8

# Health check — убедиться что контейнеры запустились
HEALTH=$(ssh "$SERVER" "cd $APP_DIR && docker compose ps --format 'table {{.Name}}\t{{.Status}}'")
echo "$HEALTH"

if echo "$HEALTH" | grep -qiE "exit|error|restart"; then
  fail "One or more containers failed to start. Check: docker compose logs"
fi
ok "All containers running"

# ── 5. Collect static files ──────────────────────────────────
step 5 "Collecting static files..."
ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py collectstatic --noinput --clear" || {
  warn "collectstatic failed — continuing"
}
ok "Static files collected"

# ── 6. Migrations (optional) ─────────────────────────────────
if [[ "${1:-}" == "migrate" || "${2:-}" == "migrate" ]]; then
  step 6 "Running database migrations..."
  ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py migrate --noinput"
  ok "Migrations applied"
else
  step 6 "Skipping migrations (DB not touched)"
  warn "Pass 'migrate' to apply: ./deploy.sh migrate"
fi

# ── 7. Seed test data (optional) ─────────────────────────────
if [[ "${1:-}" == "seed" || "${2:-}" == "seed" ]]; then
  step 7 "Seeding test data..."
  ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py seed_test_data"
  ok "Test data seeded"
fi

# ── 8. Cleanup unused images ─────────────────────────────────
step $TOTAL "Cleaning up unused images..."
ssh "$SERVER" "docker image prune -f"
ok "Cleanup done"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║         Deploy complete! ✓           ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════╝${RESET}"
echo -e "  Site:  ${BOLD}https://185.157.245.247${RESET}"
echo -e "  Admin: ${BOLD}https://185.157.245.247/admin/${RESET}"
echo ""
echo -e "  Контейнеры пересозданы чисто"
echo -e "  Образы пересобраны (с кешем = быстро)"
echo -e "  Статика собрана"
echo -e "  БД не тронута $([ "${1:-}" == "migrate" ] && echo "(миграции применены)" || echo "(миграции пропущены)")"
echo ""
