#!/bin/sh
set -eu

cd /app

if [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi

if [ ! -d node_modules ] || [ ! -x node_modules/.bin/vite ]; then
  npm ci
fi

exec "$@"
