#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

response=$(docker compose exec -T backend sh -c 'wget -qO- http://localhost:8080/actuator/health')

echo "$response"

if ! echo "$response" | grep -q '"status":"UP"'; then
   echo "============================================================="
   echo "Unable to reach Isle health endpoint inside the backend container !!"
   echo "============================================================="
   exit 1
fi

echo "================="
echo "Smoke Test passed"
echo "================="
