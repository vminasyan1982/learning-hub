#!/bin/bash
# Full server setup for Learning Hub on Ubuntu 20.04/22.04/24.04
# Run once on a fresh server:
#   ssh root@185.157.245.247
#   curl -fsSL https://raw.githubusercontent.com/vminasyan1982/learning-hub/main/scripts/server-setup.sh | bash

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${YELLOW}[..] $1${NC}"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

echo "=============================================="
echo "   Learning Hub — Server Setup"
echo "   Server: 185.157.245.247"
echo "=============================================="
echo ""

# ── 1. System packages ────────────────────────────
info "Updating apt packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
    curl wget git ca-certificates gnupg lsb-release \
    python3 python3-pip python3-venv \
    openssl nano htop ufw \
    2>/dev/null
ok "System packages installed (python3 $(python3 --version 2>&1 | cut -d' ' -f2), pip $(pip3 --version | cut -d' ' -f2))"

# ── 2. Docker ─────────────────────────────────────
if ! command -v docker &>/dev/null; then
    info "Installing Docker Engine..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    ok "Docker installed: $(docker --version)"
else
    ok "Docker already installed: $(docker --version)"
fi

# Docker Compose plugin check
docker compose version &>/dev/null || apt-get install -y -qq docker-compose-plugin
ok "Docker Compose: $(docker compose version --short)"

# ── 3. Firewall ───────────────────────────────────
info "Configuring UFW firewall..."
ufw --force reset >/dev/null 2>&1
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1
ufw allow 22/tcp    >/dev/null 2>&1   # SSH
ufw allow 80/tcp    >/dev/null 2>&1   # HTTP (redirect to HTTPS)
ufw allow 443/tcp   >/dev/null 2>&1   # HTTPS
ufw --force enable  >/dev/null 2>&1
ok "Firewall: ports 22, 80, 443 open"

# ── 4. Clone repository ───────────────────────────
if [ ! -d "/opt/learning-hub/.git" ]; then
    info "Cloning repository from GitHub..."
    git clone https://github.com/vminasyan1982/learning-hub.git /opt/learning-hub
    ok "Repository cloned to /opt/learning-hub"
else
    info "Repository exists, pulling latest..."
    git -C /opt/learning-hub pull origin main
    ok "Repository up to date"
fi

cd /opt/learning-hub

# ── 5. .env file ──────────────────────────────────
if [ ! -f ".env" ]; then
    cp .env.example .env
    # Generate a strong secret key automatically
    SECRET=$(python3 -c "import secrets, string; print(''.join(secrets.choices(string.ascii_letters+string.digits+'!@#$%^&*', k=64)))")
    sed -i "s|change-me-to-a-long-random-string-at-least-50-chars|$SECRET|g" .env
    # Set allowed hosts
    sed -i "s|DJANGO_ALLOWED_HOSTS=.*|DJANGO_ALLOWED_HOSTS=185.157.245.247,localhost|g" .env
    # Set CORS
    sed -i "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://185.157.245.247|g" .env
    ok ".env created with auto-generated secret key"
    echo ""
    echo -e "${YELLOW}  !!! IMPORTANT: Edit /opt/learning-hub/.env !!!${NC}"
    echo "  Set at minimum:"
    echo "    POSTGRES_PASSWORD   — change from default"
    echo "    EMAIL_HOST_USER     — your SMTP email"
    echo "    EMAIL_HOST_PASSWORD — your SMTP app password"
    echo "    ADMIN_EMAIL         — where to receive notifications"
    echo ""
else
    ok ".env already exists"
fi

# ── 6. SSL certificate ────────────────────────────
info "Generating SSL certificate for IP 185.157.245.247..."
bash scripts/generate-ssl.sh
ok "SSL certificate generated in nginx/ssl/"

# ── 7. SSH deploy key for GitHub Actions ─────────
mkdir -p /root/.ssh
chmod 700 /root/.ssh

if [ ! -f "/root/.ssh/deploy_key" ]; then
    info "Generating GitHub Actions deploy SSH key..."
    ssh-keygen -t ed25519 -C "learning-hub-deploy@185.157.245.247" \
        -f /root/.ssh/deploy_key -N "" -q
    cat /root/.ssh/deploy_key.pub >> /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
    ok "Deploy key created"
else
    ok "Deploy key already exists"
fi

# ── 8. First build & start ────────────────────────
info "Building Docker images and starting containers..."
docker compose up --build -d

ok "Containers started"

# ── 9. Wait and run migrations ────────────────────
info "Waiting for database to be ready (15s)..."
sleep 15

info "Running Django migrations..."
docker compose exec -T backend python manage.py migrate --noinput
ok "Migrations applied"

info "Collecting static files..."
docker compose exec -T backend python manage.py collectstatic --noinput --quiet
ok "Static files collected"

# ── 10. Create superuser prompt ───────────────────
echo ""
echo "=============================================="
echo -e "${GREEN}Setup complete!${NC}"
echo "=============================================="
echo ""
echo "  Site:        https://185.157.245.247"
echo "  Django Admin: https://185.157.245.247/admin/"
echo "  API Docs:    https://185.157.245.247/api/docs/"
echo ""
echo "  Create admin user:"
echo "    docker compose -f /opt/learning-hub/docker-compose.yml exec backend python manage.py createsuperuser"
echo ""
echo "=============================================="
echo "  GitHub Actions SSH secrets (add to GitHub):"
echo "=============================================="
echo "  SSH_HOST         = 185.157.245.247"
echo "  SSH_USER         = root"
echo "  SSH_PRIVATE_KEY  ="
cat /root/.ssh/deploy_key
echo ""
echo "  (copy the entire key including -----BEGIN/END----- lines)"
echo ""
echo "  After adding secrets — every git push to main auto-deploys!"
