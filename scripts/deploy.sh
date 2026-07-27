#!/bin/bash
set -e

# Le' o tar.gz que o job "deploy" ja' colocou aqui via scp (appleboy/scp-action) —
# este script NUNCA builda nada, so' troca o build pronto e reinicia. A VM
# tem so' 1GB de RAM; "next build" nao roda aqui de proposito.
RELEASE_ARCHIVE="$HOME/cgbags-frontend-releases/standalone.tar.gz"
APP_DIR="$HOME/cgbags-frontend-app"

echo "==============================="
echo "CG Bags Frontend Deploy"
echo "==============================="

echo ""
echo "Extraindo novo build..."

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$RELEASE_ARCHIVE" -C "$APP_DIR"

echo ""
echo "Reiniciando frontend..."

sudo systemctl daemon-reload
sudo systemctl restart cgbags-frontend

echo ""
echo "Aguardando inicialização..."

# Mesmo padrao do backend: poll em vez de sleep fixo, tempo de start varia.
ready=false
for i in $(seq 1 30); do
  if curl --fail -s -o /dev/null http://127.0.0.1:3000; then
    ready=true
    break
  fi
  sleep 2
done

if [ "$ready" != "true" ]; then
  echo "Timeout: frontend não respondeu a tempo."
  exit 1
fi

echo ""
echo "Deploy concluído!"
