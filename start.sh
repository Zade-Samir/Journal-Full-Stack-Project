#!/bin/bash

echo "======================================================================="
echo "  Starting Journal App Services (macOS)"
echo "======================================================================="

# Check if DB_PASSWORD is set, if not prompt the user (silently)
if [ -z "$DB_PASSWORD" ]; then
    read -sp "Enter MySQL root password: " DB_PASSWORD
    echo ""
    export DB_PASSWORD
fi

if [ -z "$JWT_SECRET" ]; then
    export JWT_SECRET="myLocalDevSecretKey_replaceInProd_32chars"
fi

# Get the absolute workspace directory
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure Maven wrappers are executable
chmod +x "$WORKSPACE_DIR"/Backend/*/mvnw

echo ""
echo "1. Starting Eureka Server (Service Registry) on Port 8761..."
osascript -e "tell app \"Terminal\" to do script \"cd '$WORKSPACE_DIR/Backend/eureka-server' && ./mvnw spring-boot:run\""

echo ""
echo "Waiting 12 seconds for Eureka Server to fully initialize..."
sleep 12

echo ""
echo "2. Starting Auth Service on Port 8082..."
osascript -e "tell app \"Terminal\" to do script \"cd '$WORKSPACE_DIR/Backend/auth-service' && export DB_PASSWORD='$DB_PASSWORD' && export JWT_SECRET='$JWT_SECRET' && ./mvnw spring-boot:run\""

echo ""
echo "3. Starting Journal Service on Port 8081..."
osascript -e "tell app \"Terminal\" to do script \"cd '$WORKSPACE_DIR/Backend/journal-service' && export DB_PASSWORD='$DB_PASSWORD' && ./mvnw spring-boot:run\""

echo ""
echo "4. Starting API Gateway on Port 8080..."
osascript -e "tell app \"Terminal\" to do script \"cd '$WORKSPACE_DIR/Backend/api-gateway' && export JWT_SECRET='$JWT_SECRET' && ./mvnw spring-boot:run\""

echo ""
echo "5. Starting Frontend (Vite Dev Server)..."
osascript -e "tell app \"Terminal\" to do script \"cd '$WORKSPACE_DIR/Frontend' && npm run dev\""

echo ""
echo "======================================================================="
echo "  All services launched in separate Terminal windows!"
echo "======================================================================="
