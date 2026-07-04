/**
 * Central API config — all base URLs read from .env
 * Change only the .env file (or set env vars on the server) to switch environments.
 *
 * Local (.env):
 *   VITE_API_BASE_URL=http://localhost:8080
 *   VITE_AUTH_BASE_URL=http://localhost:8082
 *
 * Production (.env.production or server env vars):
 *   VITE_API_BASE_URL=https://your-api-gateway.onrender.com
 *   VITE_AUTH_BASE_URL=https://your-auth-service.onrender.com
 */

// Main API Gateway — all journal routes go through here
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth Service (direct) — used only for Google OAuth2 initiation
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;
