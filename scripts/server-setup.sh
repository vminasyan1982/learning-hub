#!/bin/bash
# Run this script ONCE on the server to prepare it for deployment.
# Usage: ssh root@185.157.245.247 "bash -s" < scripts/server-setup.sh

set -e

echo "=== Learning Hub — Server Setup ==="
echo "Server: 185.157.245.247"
echo ""

# Install Docker
if ! command -v docker &>/dev/null; then
    echo "[1/5] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/5] Docker already installed: $(docker --version)"
fi

# Install Docker Compose plugin
if ! docker compose version &>/dev/null; then
    echo "[2/5] Installing Docker Compose plugin..."
    apt-get install -y docker-compose-plugin
else
    echo "[2/5] Docker Compose already installed: $(docker compose version)"
fi

# Install Git
if ! command -v git &>/dev/null; then
    echo "[3/5] Installing Git..."
    apt-get update && apt-get install -y git
else
    echo "[3/5] Git already installed: $(git --version)"
fi

# Clone repository
if [ ! -d "/opt/learning-hub" ]; then
    echo "[4/5] Cloning repository..."
    git clone https://github.com/vminasyan1982/learning-hub.git /opt/learning-hub
else
    echo "[4/5] Repository already exists at /opt/learning-hub"
fi

cd /opt/learning-hub

# Create .env from example if not exists
if [ ! -f ".env" ]; then
    echo "[5/5] Creating .env file..."
    cp .env.example .env
    echo ""
    echo "!!! IMPORTANT: Edit /opt/learning-hub/.env with your real values !!!"
    echo "    nano /opt/learning-hub/.env"
else
    echo "[5/5] .env already exists"
fi

# Generate SSL certificate
echo ""
echo "[SSL] Generating SSL certificate for 185.157.245.247..."
bash scripts/generate-ssl.sh

# Set up deploy SSH key (for GitHub Actions)
echo ""
echo "=== GitHub Actions SSH Setup ==="
echo "Generating deploy SSH key pair..."
ssh-keygen -t ed25519 -C "github-actions-deploy" -f /root/.ssh/deploy_key -N ""
echo ""
echo "Add this PUBLIC key to the server's authorized_keys:"
cat /root/.ssh/deploy_key.pub
echo ""
echo "Add this PRIVATE key to GitHub Secrets as SSH_PRIVATE_KEY:"
cat /root/.ssh/deploy_key
echo ""
cat /root/.ssh/deploy_key.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Edit /opt/learning-hub/.env with real values"
echo "2. Add the SSH private key above to GitHub Secrets:"
echo "   - SSH_HOST = 185.157.245.247"
echo "   - SSH_USER = root"
echo "   - SSH_PRIVATE_KEY = (the private key printed above)"
echo "3. Push to main branch → auto-deploy runs"
echo ""
echo "To start manually:"
echo "  cd /opt/learning-hub && docker compose up --build -d"
