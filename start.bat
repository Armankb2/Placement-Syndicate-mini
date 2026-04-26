@echo off
echo ====================================
echo Mini Project - Quick Start
echo ====================================
echo.

echo [1/4] Starting Docker services (Keycloak, MySQL, MongoDB)...
docker-compose up -d

echo.
echo [2/4] Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak

echo.
echo [3/4] Services Status:
docker-compose ps

echo.
echo [4/4] Setup Instructions:
echo.
echo 1. Configure Keycloak:
echo    - Open http://localhost:9090
echo    - Login: admin / admin
echo    - Import keycloak-realm-export.json
echo.
echo 2. Start microservices (open 4 separate terminals):
echo    Terminal 1: cd discovery-service ^& mvn spring-boot:run
echo    Terminal 2: cd user-service ^& mvn spring-boot:run
echo    Terminal 3: cd experience-service ^& mvn spring-boot:run
echo    Terminal 4: cd api-gatway ^& mvn spring-boot:run
echo.
echo 3. Start frontend:
echo    cd frontend ^& npm install ^& npm run dev
echo.
echo 4. Open http://localhost:3000
echo    Login: student / password (or admin / admin)
echo.
echo ====================================
echo Press any key to exit...
pause >nul

