#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

max_retries=30
retry_interval=10

for i in $(seq 1 "$max_retries"); do
  echo "Attempt $i/$max_retries: checking backend health..."
  if response=$(docker compose exec -T backend sh -c 'wget -qO- http://localhost:8080/actuator/health' 2>/dev/null); then
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
exit 1
