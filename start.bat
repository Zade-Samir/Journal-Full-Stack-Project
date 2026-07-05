@echo off
setlocal enabledelayedexpansion

:: Load environment variables from .env file if it exists
if exist .env (
    for /f "usebackq tokens=1,2 delims==" %%i in (".env") do (
        set "%%i=%%j"
    )
)

echo =======================================================================
echo   Starting Journal App Services (Windows)
echo =======================================================================

:: Check if DB_PASSWORD is set, if not prompt the user
if "%DB_PASSWORD%"=="" (
    echo DB_PASSWORD environment variable is not set.
    set /p DB_PASSWORD="Enter MySQL root password: "
)

:: Confirm other key variables or use default
if "%JWT_SECRET%"=="" (
    set JWT_SECRET=myLocalDevSecretKey_replaceInProd_32chars
)

echo.
echo 1. Starting Eureka Server (Service Registry) on Port 8761...
cd Backend\eureka-server
start "Eureka Server [Port 8761]" cmd /k "mvnw spring-boot:run"
cd ..\..

echo.
echo Waiting 12 seconds for Eureka Server to fully initialize...
timeout /t 12 /nobreak

echo.
echo 2. Starting Auth Service on Port 8082...
cd Backend\auth-service
start "Auth Service [Port 8082]" cmd /k "set DB_PASSWORD=%DB_PASSWORD%&& set JWT_SECRET=%JWT_SECRET%&& set GOOGLE_CLIENT_ID=%GOOGLE_CLIENT_ID%&& set GOOGLE_CLIENT_SECRET=%GOOGLE_CLIENT_SECRET%&& set RESEND_API_KEY=%RESEND_API_KEY%&& set RESEND_FROM_EMAIL=%RESEND_FROM_EMAIL%&& mvnw spring-boot:run"
cd ..\..

echo.
echo 3. Starting Journal Service on Port 8081...
cd Backend\journal-service
start "Journal Service [Port 8081]" cmd /k "set DB_PASSWORD=%DB_PASSWORD%&& mvnw spring-boot:run"
cd ..\..

echo.
echo 4. Starting API Gateway on Port 8080...
cd Backend\api-gateway
start "API Gateway [Port 8080]" cmd /k "set JWT_SECRET=%JWT_SECRET%&& mvnw spring-boot:run"
cd ..\..

echo.
echo 5. Starting Frontend (Vite Dev Server)...
cd Frontend
start "Frontend [Port 5173]" cmd /k "npm run dev"
cd ..

echo.
echo =======================================================================
echo   All services have been launched in separate terminal windows!
echo   You can inspect each window for logs and error messages.
echo =======================================================================
pause
