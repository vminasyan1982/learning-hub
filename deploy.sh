#!/bin/bash
# Learning Hub — Deploy Script
#
# Usage:
#   ./deploy.sh              — standard deploy (always migrates)
#   ./deploy.sh seed         — deploy + seed test data
#   BUILD_NO_CACHE=true ./deploy.sh  — force full rebuild (slow)

set -euo pipefail

SERVER="root@185.157.245.247"
APP_DIR="/opt/learning-hub"
BUILD_NO_CACHE=${BUILD_NO_CACHE:-false}
ARG="${1:-}"

BOLD="\033[1m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; RED="\033[0;31m"; RESET="\033[0m"
step() { echo -e "\n${BOLD}[$1/7] $2${RESET}"; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }

echo -e "\n${BOLD}╔══════════════════════════════════════╗"
echo -e "║    Learning Hub — Deploy to Prod     ║"
echo -e "╚══════════════════════════════════════╝${RESET}"
echo -e "  Server: ${SERVER}\n"

# 1 — Sync code
step 1 "Syncing code from GitHub..."
ssh "$SERVER" "cd $APP_DIR && git fetch origin main && git reset --hard origin/main"
ok "Code updated"

# 2 — Stop old containers
step 2 "Stopping old containers..."
ssh "$SERVER" "cd $APP_DIR && docker compose down --remove-orphans"
ok "Old containers removed"

# 3 — Build and start
step 3 "Building and starting containers..."
if [ "$BUILD_NO_CACHE" = "true" ]; then
  warn "Full rebuild (no cache) — will be slow"
  ssh "$SERVER" "cd $APP_DIR && docker compose up --build --no-cache -d"
else
  ssh "$SERVER" "cd $APP_DIR && docker compose up --build -d"
fi

echo "  Waiting for services to start..."
sleep 12

HEALTH=$(ssh "$SERVER" "cd $APP_DIR && docker compose ps --format 'table {{.Name}}\t{{.Status}}'")
echo "$HEALTH"
if echo "$HEALTH" | grep -qiE "exit|error|restart"; then
  echo -e "${RED}✗ Container failed. Check: ssh $SERVER 'cd $APP_DIR && docker compose logs'${RESET}"
  exit 1
fi
ok "Containers running"

# 4 — Create missing migrations
step 4 "Creating missing migrations..."
ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py makemigrations --noinput"
# Copy new migration files from container to host so next build includes them
ssh "$SERVER" "cd $APP_DIR && for app in accounts trainings registry trainers trainees portfolio skills idp; do
  docker compose cp backend:/app/backend/apps/\$app/migrations/. ./backend/apps/\$app/migrations/ 2>/dev/null || true
done"
ok "Migrations ready"

# 5 — Apply migrations
step 5 "Applying migrations..."
ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py migrate --noinput"
ok "Migrations applied"

# 6 — Seed (optional)
if [ "$ARG" = "seed" ]; then
  step 6 "Seeding test data..."
  ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py seed_test_data"
  ok "Test data seeded"
else
  step 6 "Skipping seed (pass 'seed' to enable)"
fi

# 7 — Cleanup
step 7 "Cleaning up old images..."
ssh "$SERVER" "docker image prune -f"
ok "Cleanup done"

echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════╗"
echo -e "║         Deploy complete! ✓           ║"
echo -e "╚══════════════════════════════════════╝${RESET}"
echo -e "  https://185.157.245.247"
echo -e "  https://185.157.245.247/admin/\n"
