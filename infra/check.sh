#!/bin/bash

response=$(curl -sS http://localhost:8081/actuator/health)

echo "$response"

echo "$response" | grep -q '"status":"UP"'
if [ $? -ne "0" ]; then
   echo "============================================================="
   echo "Unable to reach Isle health endpoint on port 8081 !!"
   echo "============================================================="
elif ! echo "$response" | grep -q '"uptime"'; then
   echo "============================================================="
   echo "Isle health endpoint did not include uptime details !!"
   echo "============================================================="
else
   echo "================="
   echo "Smoke Test passed"
   echo "================="
fi
