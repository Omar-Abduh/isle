#!/bin/bash

curl -is --max-redirs 10 http://localhost:8081/api/v1/health -L | grep -w "HTTP/1.1 200" > /dev/null
if [ $? -ne "0" ]; then
   echo "============================================================="
   echo "Unable to reach Isle health endpoint on port 8081 !!"
   echo "============================================================="
else
   echo "================="
   echo "Smoke Test passed"
   echo "================="
fi
