import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Use React Router's location — more reliable than window.location.search
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/archive', { replace: true });
    } else {
      // Fallback: check window.location directly
      const windowParams = new URLSearchParams(window.location.search);
      const windowToken = windowParams.get('token');
      if (windowToken) {
        localStorage.setItem('token', windowToken);
        navigate('/archive', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-4 text-text-secondary">
      <Loader2 size={32} className="animate-spin text-brand" />
      <p className="text-sm font-medium">Completing sign-in...</p>
    </div>
  );
}
