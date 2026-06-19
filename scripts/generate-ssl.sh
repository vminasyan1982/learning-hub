#!/bin/bash
# Generates a self-signed SSL certificate with IP SAN for 185.157.245.247
# Valid for 10 years. Import nginx/ssl/cert.pem into browsers/OS to avoid warnings.

set -e

SERVER_IP="185.157.245.247"
SSL_DIR="$(dirname "$0")/../nginx/ssl"

mkdir -p "$SSL_DIR"

echo "Generating self-signed SSL certificate for IP: $SERVER_IP"

openssl req -x509 -nodes -days 3650 \
  -newkey rsa:4096 \
  -keyout "$SSL_DIR/key.pem" \
  -out "$SSL_DIR/cert.pem" \
  -subj "/C=AM/ST=Yerevan/L=Yerevan/O=Learning Hub/OU=IT/CN=$SERVER_IP" \
  -addext "subjectAltName=IP:$SERVER_IP" \
  -addext "basicConstraints=CA:FALSE" \
  -addext "keyUsage=digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth"

chmod 600 "$SSL_DIR/key.pem"
chmod 644 "$SSL_DIR/cert.pem"

echo ""
echo "SSL certificate generated:"
echo "  Certificate: $SSL_DIR/cert.pem"
echo "  Private key: $SSL_DIR/key.pem"
echo ""
echo "To avoid browser warnings, import cert.pem as a trusted CA on each client."
echo ""
openssl x509 -in "$SSL_DIR/cert.pem" -text -noout | grep -E "Subject:|Subject Alternative Name|IP Address"
