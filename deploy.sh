#!/bin/bash
# ─────────────────────────────────────────────
#  Learning Hub — Manual Deploy Script
#  Usage:
#    ./deploy.sh           — deploy only
#    ./deploy.sh migrate   — deploy + run migrations
#    ./deploy.sh migrate seed — deploy + migrate + seed test data
# ─────────────────────────────────────────────

set -e

SERVER="root@185.157.245.247"
APP_DIR="/opt/learning-hub"
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

step() { echo -e "\n${BOLD}==> $1${RESET}"; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }

echo -e "${BOLD}Learning Hub — Deploy to ${SERVER}${RESET}"
echo "────────────────────────────────────────"

# ── 1. Pull latest code ──────────────────────
step "Pulling latest code on server..."
ssh "$SERVER" "cd $APP_DIR && git pull origin main"
ok "Code updated"

# ── 2. Stop old containers ───────────────────
step "Stopping and removing old containers..."
ssh "$SERVER" "cd $APP_DIR && docker compose down --remove-orphans"
ok "Old containers removed"

# ── 3. Build and start fresh ─────────────────
step "Building and starting fresh containers..."
ssh "$SERVER" "cd $APP_DIR && docker compose up --build -d"
ok "Containers started"

# ── 4. Collect static ────────────────────────
step "Collecting static files..."
ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py collectstatic --noinput --clear"
ok "Static files collected"

# ── 5. Migrations (optional) ─────────────────
if [[ "$1" == "migrate" || "$2" == "migrate" ]]; then
  step "Running database migrations..."
  ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py migrate --noinput"
  ok "Migrations applied"
else
  warn "Migrations skipped. Run './deploy.sh migrate' if you added new model fields."
fi

# ── 6. Seed test data (optional) ─────────────
if [[ "$1" == "seed" || "$2" == "seed" ]]; then
  step "Seeding test data..."
  ssh "$SERVER" "cd $APP_DIR && docker compose exec -T backend python manage.py seed_test_data"
  ok "Test data seeded"
fi

# ── 7. Cleanup ───────────────────────────────
step "Cleaning up unused images..."
ssh "$SERVER" "docker image prune -f"
ok "Cleanup done"

# ── 8. Health check ──────────────────────────
step "Health check..."
STATUS=$(ssh "$SERVER" "cd $APP_DIR && docker compose ps --format 'table {{.Name}}\t{{.Status}}'")
echo "$STATUS"

echo ""
echo -e "${GREEN}${BOLD}Deploy complete!${RESET}"
echo "────────────────────────────────────────"
echo -e "  Site:  ${BOLD}https://185.157.245.247${RESET}"
echo -e "  Admin: ${BOLD}https://185.157.245.247/admin/${RESET}"
echo ""
