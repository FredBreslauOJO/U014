#!/bin/bash

sudo rm -rf node_modules

docker compose down --timeout=0
docker compose build
docker compose up -d

supabase start

CHROME_APP_ID=fjjokaeaohhhdnjkcgnbngcjlkfghcnd
if [ -f "$HOME/.local/share/applications/chrome-$CHROME_APP_ID-Default.desktop" ]; then
  google-chrome --profile-directory=Default --app-id="$CHROME_APP_ID"
fi