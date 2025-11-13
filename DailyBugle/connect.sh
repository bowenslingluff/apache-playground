#!/bin/bash

echo "🔌 Establishing connections to the Daily Bugle..."

kubectl port-forward svc/web-server 8080:80 &
PID1=$!

kubectl port-forward svc/auth-service 8081:8081 &
PID2=$!

kubectl port-forward svc/article-service 8082:8082 &
PID3=$!

kubectl port-forward svc/ad-service 8083:8083 &
PID4=$!

echo "✅ Connected! Press CTRL+C to stop all connections."

cleanup() {
    echo "🛑 Shutting down connections..."
    kill $PID1 $PID2 $PID3 $PID4
    exit
}

trap cleanup SIGINT
wait