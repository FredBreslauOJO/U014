#!/bin/bash

sudo rm -rf node_modules

docker compose down --timeout=0
docker compose build
docker compose up -d

google-chrome --profile-directory=Default --app-id=fjjokaeaohhhdnjkcgnbngcjlkfghcnd