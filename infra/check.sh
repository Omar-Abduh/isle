#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

max_retries=30
retry_interval=10

for i in $(seq 1 "$max_retries"); do
  echo "Attempt $i/$max_retries: checking backend health..."

  ps_out=$(docker compose ps 2>/dev/null)
  if ! echo "$ps_out" | grep -q "backend.*Up"; then
    echo "  backend container is not running. Current state:"
    echo "$ps_out"
    sleep "$retry_interval"
    continue
  fi

  if response=$(docker compose exec -T backend sh -c 'wget -qO- http://localhost:8080/actuator/health' 2>&1); then
    echo "$response"
    if echo "$response" | grep -q '"status":"UP"'; then
      echo "================="
      echo "Smoke Test passed"
      echo "================="
      exit 0
    fi
  fi
  sleep "$retry_interval"
done

echo "============================================================="
echo "Unable to reach Isle health endpoint inside the backend container !!"
echo "============================================================="
echo ""
echo "--- Container status ---"
docker compose ps
echo ""
echo "--- Backend container logs (last 80 lines) ---"
docker compose logs --tail=80 backend
echo ""
echo "--- Database container logs (last 30 lines) ---"
docker compose logs --tail=30 db
exit 1
