#!/bin/bash
# Local development setup (Mac/Linux) — creates venv and installs dependencies
# Run from the project root: bash scripts/setup-dev.sh

set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${YELLOW}[..] $1${NC}"; }

cd "$(dirname "$0")/.."

# ── Backend venv ──────────────────────────────────
info "Creating Python virtual environment in backend/.venv..."
python3 -m venv backend/.venv
source backend/.venv/bin/activate

info "Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r backend/requirements.txt -q
ok "Backend venv ready: backend/.venv"

# ── Dev .env ──────────────────────────────────────
if [ ! -f ".env" ]; then
    cp .env.example .env
    # Override for local SQLite-free dev with Docker Postgres
    sed -i '' \
        's|DJANGO_DEBUG=False|DJANGO_DEBUG=True|g; s|POSTGRES_HOST=db|POSTGRES_HOST=localhost|g' \
        .env 2>/dev/null || \
    sed -i \
        's|DJANGO_DEBUG=False|DJANGO_DEBUG=True|; s|POSTGRES_HOST=db|POSTGRES_HOST=localhost|' \
        .env
    ok ".env created from .env.example (DEBUG=True, POSTGRES_HOST=localhost)"
else
    ok ".env already exists"
fi

ok ""
ok "Dev setup complete!"
echo ""
echo "  Activate venv:     source backend/.venv/bin/activate"
echo "  Run migrations:    python backend/manage.py migrate"
echo "  Start Django:      python backend/manage.py runserver"
echo "  Deactivate:        deactivate"
echo ""
echo "  Or run everything with Docker: docker compose up --build"
