#!/bin/bash
# Check that all Learning Hub services are running correctly
# Run on the server: bash /opt/learning-hub/scripts/check-health.sh

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; FAILED=1; }
info() { echo -e "${YELLOW}[..]${NC}   $1"; }

FAILED=0
cd /opt/learning-hub 2>/dev/null || { echo "Run from server at /opt/learning-hub"; exit 1; }

echo "=============================================="
echo "   Learning Hub — Health Check"
echo "   $(date)"
echo "=============================================="
echo ""

# 1. Docker containers
info "Checking Docker containers..."
for svc in db backend frontend nginx; do
    STATUS=$(docker compose ps --status running --services 2>/dev/null | grep "^${svc}$" || true)
    if [ -n "$STATUS" ]; then
        ok "Container '$svc' is running"
    else
        fail "Container '$svc' is NOT running"
        docker compose ps "$svc" 2>/dev/null || true
    fi
done
echo ""

# 2. Database connectivity
info "Checking PostgreSQL..."
DB_CHECK=$(docker compose exec -T db pg_isready -U "${POSTGRES_USER:-learninghub}" 2>/dev/null | tail -1)
if echo "$DB_CHECK" | grep -q "accepting connections"; then
    ok "PostgreSQL is accepting connections"
else
    fail "PostgreSQL not ready: $DB_CHECK"
fi
echo ""

# 3. Django API
info "Checking Django API (internal)..."
API_STATUS=$(docker compose exec -T backend curl -sk -o /dev/null -w "%{http_code}" \
    http://localhost:8000/api/v1/auth/login/ 2>/dev/null || echo "000")
if [ "$API_STATUS" = "405" ] || [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "400" ]; then
    ok "Django API is responding (HTTP $API_STATUS)"
else
    fail "Django API not responding (HTTP $API_STATUS)"
fi
echo ""

# 4. HTTPS via Nginx
info "Checking HTTPS endpoint..."
HTTPS_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" \
    --max-time 5 https://185.157.245.247/ 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "304" ]; then
    ok "HTTPS is working (HTTP $HTTPS_STATUS)"
elif [ "$HTTPS_STATUS" = "000" ]; then
    fail "Cannot reach https://185.157.245.247/ — check Nginx container"
else
    ok "HTTPS responding (HTTP $HTTPS_STATUS)"
fi
echo ""

# 5. SSL certificate
info "Checking SSL certificate..."
CERT_DAYS=$(echo | openssl s_client -connect 185.157.245.247:443 -servername 185.157.245.247 2>/dev/null \
    | openssl x509 -noout -dates 2>/dev/null \
    | grep notAfter | cut -d= -f2 || echo "")
if [ -n "$CERT_DAYS" ]; then
    ok "SSL certificate valid, expires: $CERT_DAYS"
else
    fail "Could not read SSL certificate"
fi
echo ""

# 6. Django Admin
info "Checking Django Admin..."
ADMIN_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" \
    --max-time 5 https://185.157.245.247/admin/ 2>/dev/null || echo "000")
if [ "$ADMIN_STATUS" = "200" ] || [ "$ADMIN_STATUS" = "302" ]; then
    ok "Django Admin accessible (HTTP $ADMIN_STATUS)"
else
    fail "Django Admin not accessible (HTTP $ADMIN_STATUS)"
fi
echo ""

# 7. Disk & memory
info "Checking system resources..."
DISK=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
MEM=$(free -m | awk 'NR==2{printf "%.0f%%", $3/$2*100}')
[ "$DISK" -lt 85 ] && ok "Disk usage: ${DISK}%" || fail "Disk usage high: ${DISK}%"
ok "Memory usage: $MEM"
echo ""

# Summary
echo "=============================================="
if [ "$FAILED" = "0" ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo "Site is live at https://185.157.245.247"
else
    echo -e "${RED}Some checks failed. See above.${NC}"
    echo ""
    echo "Debug commands:"
    echo "  docker compose logs backend  — Django errors"
    echo "  docker compose logs nginx    — Nginx errors"
    echo "  docker compose logs db       — PostgreSQL errors"
    echo "  docker compose ps            — Container status"
fi
echo "=============================================="
