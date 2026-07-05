import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token. Please use the complete link sent to your email.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify?token=${token}`, {
          method: 'GET',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success === false) {
          throw new Error(data.message || data.error || 'Verification failed.');
        }

        setStatus('success');
        setMessage('Your email has been verified successfully! You can now log in to your account.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred during verification.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex bg-bg-base font-sans text-text-primary items-center justify-center p-6 relative">
      
      {/* Back button */}
      <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft size={16} />
        Back to Login
      </Link>

      <div className="w-full max-w-md p-8 sm:p-12 rounded-[2rem] border border-border bg-card-bg shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/5 blur-3xl rounded-full -z-10"></div>

        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center mb-6 animate-pulse">
              <Loader2 size={32} className="animate-spin text-text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-3 tracking-tight">Verifying Email</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              {message}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 text-green-500">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-3 tracking-tight">Success!</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-8">
              {message}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-8 py-3.5 rounded-full bg-text-primary text-bg-base text-sm font-semibold tracking-wide hover:opacity-90 transition-colors shadow-lg"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-500">
              <XCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-3 tracking-tight">Verification Failed</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-8">
              {message}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full px-8 py-3.5 rounded-full bg-text-primary text-bg-base text-sm font-semibold tracking-wide hover:opacity-90 transition-colors shadow-lg"
            >
              Back to Registration
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
