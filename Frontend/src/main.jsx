import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor for Access + Refresh Token Flow
const originalFetch = window.fetch;
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

window.fetch = async (url, options = {}) => {
  // Check if target is backend API
  const isApiRequest = typeof url === 'string' && url.startsWith(import.meta.env.VITE_API_BASE_URL);

  if (isApiRequest) {
    // 1. Force credentials: 'include' so HttpOnly cookies are stored/transmitted
    options.credentials = 'include';

    // 2. Ensure Authorization header has the current token if available
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  let response = await originalFetch(url, options);

  // 3. Intercept 401 Unauthorized errors and trigger dynamic token refreshing
  if (
    response.status === 401 &&
    isApiRequest &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/login')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const refreshRes = await originalFetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken = data.data?.token;

          if (newToken) {
            localStorage.setItem('token', newToken);
            isRefreshing = false;
            onRefreshed(newToken);
          } else {
            throw new Error('Refresh token invalid');
          }
        } else {
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('token');
        window.location.href = '/login';
        return response;
      }
    }

    // Queue request to retry once the refresh completes
    const retryOriginalRequest = new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        // Rewrite Authorization header
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        };
        resolve(originalFetch(url, options));
      });
    });

    return retryOriginalRequest;
  }

  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
